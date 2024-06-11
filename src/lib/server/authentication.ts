import "server-only";
import crypto from "crypto";
import RedisDB from "./redisDB";
import {
  REDIS_NAME_PATTERNS,
  REDIS_USER_FIELDS,
  AUTHENTICATION_ERRORS,
  REDIS_ERRORS,
  RECAPTCHA_ACTIONS,
  AUTH_PROVIDERS,
} from "./serverConstants";
import { getRandomBase58String, verifyRecaptcha } from "./serverHelperFunctions";
import { LoginUserResult } from "./serverConstants";
import z from "zod";
import Mailer from "./mailer";
import { Role, SessionWithEmail } from "../common/Types";
import { AdapterUser } from "next-auth/adapters";

//#region Credentials Auth Functions
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

    let userExists = await redisClient.EXISTS(REDIS_NAME_PATTERNS.USER_PRETAG + email);
    if (userExists) throw Error(AUTHENTICATION_ERRORS.USER_ALREADY_EXISTS);

    status = await redisClient
      .MULTI()
      .HSETNX(REDIS_NAME_PATTERNS.USER_PRETAG + email, REDIS_USER_FIELDS.OAUTH_PROVIDER, AUTH_PROVIDERS.CREDENTIALS)
      .HSETNX(REDIS_NAME_PATTERNS.USER_PRETAG + email, REDIS_USER_FIELDS.PASSWORD_SALT, passwordData.salt)
      .HSETNX(REDIS_NAME_PATTERNS.USER_PRETAG + email, REDIS_USER_FIELDS.PASSWORD_HASH, passwordData.hash)
      .EXEC(true);
  } catch (e) {
    throw Error(REDIS_ERRORS.REDIS_CLIENT_ERROR);
  }
  if (status)
    status.forEach((s: any) => {
      if (!s) {
        throw Error(REDIS_ERRORS.REDIS_CLIENT_ERROR);
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

    let recoveryToken = getRandomBase58String(9);
    let tokenExpireTime = Date.now() + 1200000; //Current time + 20 minute
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
//#endregion

//#region OAuth Functions
export async function checkLoginProvider(email: string, account_provider: string): Promise<LoginUserResult> {
  try {
    const redisClient = await RedisDB.getClient();
    //User deleted
    let userExists = await redisClient.EXISTS(REDIS_NAME_PATTERNS.USER_PRETAG + email);
    if (!userExists && account_provider === AUTH_PROVIDERS.CREDENTIALS) return LoginUserResult.Failed;

    //User login restricted
    let restricted = await redisClient.HGET(REDIS_NAME_PATTERNS.USER_PRETAG + email, REDIS_USER_FIELDS.RESTRICTED);
    if (restricted) return LoginUserResult.Restricted;

    let OAuthProvider = await redisClient.HGET(
      REDIS_NAME_PATTERNS.USER_PRETAG + email,
      REDIS_USER_FIELDS.OAUTH_PROVIDER,
    );
    if (OAuthProvider && OAuthProvider !== account_provider) return LoginUserResult.Failed;
    else if (!OAuthProvider) {
      await redisClient.HSET(
        REDIS_NAME_PATTERNS.USER_PRETAG + email,
        REDIS_USER_FIELDS.OAUTH_PROVIDER,
        account_provider,
      );
    }
  } catch (e) {
    throw Error(REDIS_ERRORS.REDIS_CLIENT_ERROR);
  }

  return LoginUserResult.Success;
}

export async function restrictedOrDeleted(email: string) {
  const redisClient = await RedisDB.getClient();

  //User deleted
  let userExists = await redisClient.EXISTS(REDIS_NAME_PATTERNS.USER_PRETAG + email);
  if (!userExists) return LoginUserResult.Failed;

  //User login restricted
  let restricted = await redisClient.HGET(REDIS_NAME_PATTERNS.USER_PRETAG + email, REDIS_USER_FIELDS.RESTRICTED);
  if (restricted) return LoginUserResult.Restricted;

  return LoginUserResult.Success;
}

//#endregion

//#region User Role Handling
export function getUserRoles(user: AdapterUser): Role[] {
  let userRoles = [Role.User];

  if (getAdminEmails().includes(user.email)) {
    userRoles.push(Role.Admin);
  }

  return userRoles;
}

function getAdminEmails() {
  const adminEmails = process.env.ADMIN_EMAILS;
  return adminEmails ? adminEmails.split(",") : [];
}

//#endregion

//#region Helper functions

function createPasswordHash(password: string) {
  let salt = crypto.randomBytes(16).toString("hex");
  let hash = crypto.pbkdf2Sync(password, salt, 1000, 64, `sha512`).toString(`hex`);
  return { hash: hash, salt: salt };
}

function isPasswordValid(password: string, salt: string, hash: string) {
  return hash === crypto.pbkdf2Sync(password, salt, 1000, 64, `sha512`).toString(`hex`);
}

//#endregion
