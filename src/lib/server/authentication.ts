import "server-only";
import crypto from "crypto";
import RedisDB from "./redisDB";
import {
  REDIS_NAME_PATTERNS,
  REDIS_USER_FIELDS,
  AUTHENTICATION_ERRORS,
  REDIS_ERRORS,
  RECAPTCHA_ACTIONS,
} from "./serverConstants";
import { makeid } from "./serverHelperFunctions";
import { LoginUserResult } from "./serverConstants";
import z from "zod";
import Mailer from "./mailer";

export async function loginUser(email: string, password: string): Promise<LoginUserResult> {
  try {
    const redisClient = await RedisDB.getClient();
    let salt = await redisClient.HGET(REDIS_NAME_PATTERNS.USER_PRETAG + email, REDIS_USER_FIELDS.PASSWORD_SALT);
    let hash = await redisClient.HGET(REDIS_NAME_PATTERNS.USER_PRETAG + email, REDIS_USER_FIELDS.PASSWORD_HASH);
    if (!salt || !hash) return LoginUserResult.Failed;

    let serverTimeMilis = Date.now();
    let loginBlockEndTime = await redisClient.HGET(
      REDIS_NAME_PATTERNS.USER_PRETAG + email,
      REDIS_USER_FIELDS.LOGIN_BLOCK_OUT_TIME,
    );

    if (loginBlockEndTime && Number(loginBlockEndTime) > serverTimeMilis) return LoginUserResult.Blocked;

    let passwordValid = isPasswordValid(password, salt, hash);
    if (!passwordValid) {
      let invalidLoginCounter = await redisClient.HINCRBY(
        REDIS_NAME_PATTERNS.USER_PRETAG + email,
        REDIS_USER_FIELDS.INVALID_LOGIN_COUNTER,
        1,
      );
      if (invalidLoginCounter > 10) {
        redisClient.HSET(
          REDIS_NAME_PATTERNS.USER_PRETAG + email,
          REDIS_USER_FIELDS.LOGIN_BLOCK_OUT_TIME,
          serverTimeMilis + 1800000,
        );
        redisClient.HSET(REDIS_NAME_PATTERNS.USER_PRETAG + email, REDIS_USER_FIELDS.INVALID_LOGIN_COUNTER, 0);
      }
      return LoginUserResult.Failed;
    } else {
      redisClient.HSET(REDIS_NAME_PATTERNS.USER_PRETAG + email, REDIS_USER_FIELDS.INVALID_LOGIN_COUNTER, 0);
      return LoginUserResult.Success;
    }
  } catch (e) {
    throw Error(REDIS_ERRORS.REDIS_CLIENT_ERROR);
  }
}

export async function registerNewUser(email: string, password: string, reCaptchaToken: string | undefined) {
  if (!reCaptchaToken) throw Error(AUTHENTICATION_ERRORS.RECAPCHA_VALIDATION_FAILED);
  let reCaptchaValidationPassed = await verifyRecaptcha(reCaptchaToken, RECAPTCHA_ACTIONS.REGISTER_FORM_SUBMIT);
  if (!reCaptchaValidationPassed) throw Error(AUTHENTICATION_ERRORS.RECAPCHA_VALIDATION_FAILED);

  let status;
  try {
    const redisClient = await RedisDB.getClient();
    let passwordData = createPasswordHash(password);

    status = await redisClient
      .MULTI()
      .HSETNX(REDIS_NAME_PATTERNS.USER_PRETAG + email, REDIS_USER_FIELDS.PASSWORD_SALT, passwordData.salt)
      .HSETNX(REDIS_NAME_PATTERNS.USER_PRETAG + email, REDIS_USER_FIELDS.PASSWORD_HASH, passwordData.hash)
      .EXEC(true);
  } catch (e) {
    throw Error(REDIS_ERRORS.REDIS_CLIENT_ERROR);
  }
  if (status)
    status.forEach((s: any) => {
      if (!s) {
        throw Error(AUTHENTICATION_ERRORS.USER_ALREADY_EXISTS);
      }
    });
}

export async function sendUserPasswordRecoveryToken(email: string, reCaptchaToken: string | undefined) {
  try {
    const redisClient = await RedisDB.getClient();
    let salt = await redisClient.HGET(REDIS_NAME_PATTERNS.USER_PRETAG + email, REDIS_USER_FIELDS.PASSWORD_SALT);
    let hash = await redisClient.HGET(REDIS_NAME_PATTERNS.USER_PRETAG + email, REDIS_USER_FIELDS.PASSWORD_HASH);
    if (!salt || !hash) return;

    if (!reCaptchaToken) throw Error(AUTHENTICATION_ERRORS.RECAPCHA_VALIDATION_FAILED);
    let reCaptchaValidationPassed = await verifyRecaptcha(reCaptchaToken, RECAPTCHA_ACTIONS.PW_RECOVERY_TOKEN_REQUEST);
    if (!reCaptchaValidationPassed) throw Error(AUTHENTICATION_ERRORS.RECAPCHA_VALIDATION_FAILED);

    let recoveryToken = makeid(9);
    let tokenExpireTime = Date.now() + 600000; //Current time + 10 minute
    redisClient
      .MULTI()
      .HSET(REDIS_NAME_PATTERNS.USER_PRETAG + email, REDIS_USER_FIELDS.RECOVERY_TOKEN, recoveryToken)
      .HSET(REDIS_NAME_PATTERNS.USER_PRETAG + email, REDIS_USER_FIELDS.INVALID_RECOVERY_TOKEN_COUNTER, "0")
      .HSET(REDIS_NAME_PATTERNS.USER_PRETAG + email, REDIS_USER_FIELDS.RECOVERY_TOKEN_EXPIRY_TIME, tokenExpireTime)
      .EXEC(true);

    Mailer.SendPasswordResetTokenMail(email, recoveryToken);
    return;
  } catch (e) {
    if (e instanceof Error && e.message === AUTHENTICATION_ERRORS.RECAPCHA_VALIDATION_FAILED)
      throw Error(AUTHENTICATION_ERRORS.RECAPCHA_VALIDATION_FAILED);
    else throw Error(REDIS_ERRORS.REDIS_CLIENT_ERROR);
  }
}

export async function updateUserPasswordWithRecoveryToken(
  email: string,
  inputRecoveryToken: string,
  newPassword: string,
) {
  try {
    const redisClient = await RedisDB.getClient();
    let recoveryTokenExpiryTime = await redisClient.HGET(
      REDIS_NAME_PATTERNS.USER_PRETAG + email,
      REDIS_USER_FIELDS.RECOVERY_TOKEN_EXPIRY_TIME,
    );
    let invalidRecoveryCounter = await redisClient.HGET(
      REDIS_NAME_PATTERNS.USER_PRETAG + email,
      REDIS_USER_FIELDS.INVALID_RECOVERY_TOKEN_COUNTER,
    );

    let recoveryToken = await redisClient.HGET(
      REDIS_NAME_PATTERNS.USER_PRETAG + email,
      REDIS_USER_FIELDS.RECOVERY_TOKEN,
    );

    let serverTimeMilis = Date.now();

    const validator = z.object({
      recoveryToken: z.string(),
      expiryTime: z.number().min(serverTimeMilis),
      invalidCounter: z.number().lte(3),
    });

    let parsedContent = validator.safeParse({
      recoveryToken: recoveryToken,
      expiryTime: Number(recoveryTokenExpiryTime),
      invalidCounter: Number(invalidRecoveryCounter),
    });
    //Token expired
    if (!parsedContent.success) {
      return false;
    }

    //Valid token
    if (recoveryToken === inputRecoveryToken) {
      let passwordData = createPasswordHash(newPassword);

      redisClient
        .MULTI()
        .HSET(REDIS_NAME_PATTERNS.USER_PRETAG + email, REDIS_USER_FIELDS.PASSWORD_SALT, passwordData.salt)
        .HSET(REDIS_NAME_PATTERNS.USER_PRETAG + email, REDIS_USER_FIELDS.PASSWORD_HASH, passwordData.hash)
        .EXEC(true);

      return true;
    } else {
      redisClient.HINCRBY(REDIS_NAME_PATTERNS.USER_PRETAG + email, REDIS_USER_FIELDS.INVALID_RECOVERY_TOKEN_COUNTER, 1);
    }
    return false;
  } catch (e) {
    if (e instanceof Error && e.message === AUTHENTICATION_ERRORS.RECAPCHA_VALIDATION_FAILED)
      throw Error(AUTHENTICATION_ERRORS.RECAPCHA_VALIDATION_FAILED);
    else throw Error(REDIS_ERRORS.REDIS_CLIENT_ERROR);
  }
}

/*Helper functions */
const verifyRecaptcha = async (token: string, action: RECAPTCHA_ACTIONS) => {
  const secretKey = process.env.RECAPCHA_SECRET_KEY;
  var verificationUrl = "https://www.google.com/recaptcha/api/siteverify?secret=" + secretKey + "&response=" + token;

  let response = await fetch(verificationUrl, {
    method: "POST",
  });

  if (response.ok) {
    let data = await response.json();
    if (data.success && data.score >= 0.5 && data.action === action) {
      return true;
    }
  }
  return false;
};

function createPasswordHash(password: string) {
  let salt = crypto.randomBytes(16).toString("hex");
  let hash = crypto.pbkdf2Sync(password, salt, 1000, 64, `sha512`).toString(`hex`);
  return { hash: hash, salt: salt };
}

function isPasswordValid(password: string, salt: string, hash: string) {
  return hash === crypto.pbkdf2Sync(password, salt, 1000, 64, `sha512`).toString(`hex`);
}
