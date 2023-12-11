"use server";
import crypto from "crypto";
import { RedisDB } from "../redisDB";
import { REDIS_NAME_PATTERNS, REDIS_USER_FIELDS, AUTHENTICATION_ERRORS, REDIS_ERRORS } from "../serverConstants";

function createPasswordHash(password: string) {
  let salt = crypto.randomBytes(16).toString("hex");
  let hash = crypto.pbkdf2Sync(password, salt, 1000, 64, `sha512`).toString(`hex`);
  return { hash: hash, salt: salt };
}

async function passwordIsValid(email: string, password: string) {
  const redisClient = await RedisDB.getClient();
  let salt = await redisClient.HGET(REDIS_NAME_PATTERNS.USER_PRETAG + email, REDIS_USER_FIELDS.PASSWORD_SALT);
  let hash = await redisClient.HGET(REDIS_NAME_PATTERNS + email, REDIS_USER_FIELDS.PASSWORD_HASH);
  if (!salt || !hash) return false;

  return hash === crypto.pbkdf2Sync(password, salt, 1000, 64, `sha512`).toString(`hex`);
}

export async function createUser(email: string, password: string) {
  if (password.length < 6) throw Error(AUTHENTICATION_ERRORS.WEEK_PASSWORD_ERROR);
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
