import "server-only";
import crypto from "crypto";
import { RedisDB } from "./redisDB";
import { REDIS_NAME_PATTERNS, REDIS_USER_FIELDS, AUTHENTICATION_ERRORS, REDIS_ERRORS } from "./serverConstants";

export async function loginUser(email: string, password: string) {
  try {
    const redisClient = await RedisDB.getClient();
    let salt = await redisClient.HGET(REDIS_NAME_PATTERNS.USER_PRETAG + email, REDIS_USER_FIELDS.PASSWORD_SALT);
    let hash = await redisClient.HGET(REDIS_NAME_PATTERNS.USER_PRETAG + email, REDIS_USER_FIELDS.PASSWORD_HASH);
    if (!salt || !hash) return false;
    return passwordIsValid(password, salt, hash);
  } catch (e) {
    throw Error(REDIS_ERRORS.REDIS_CLIENT_ERROR);
  }
}
export async function registerNewUser(email: string, password: string) {
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
function createPasswordHash(password: string) {
  let salt = crypto.randomBytes(16).toString("hex");
  let hash = crypto.pbkdf2Sync(password, salt, 1000, 64, `sha512`).toString(`hex`);
  return { hash: hash, salt: salt };
}
function passwordIsValid(password: string, salt: string, hash: string) {
  return hash === crypto.pbkdf2Sync(password, salt, 1000, 64, `sha512`).toString(`hex`);
}
