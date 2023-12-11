"use server";
import { RedisDB } from "./redisDB";
import { REDIS_ERRORS, REDIS_NAME_PATTERNS } from "./serverConstants";
import { isValidHttpURL } from "../helperFunctions";
import { randomBytes } from "crypto";

export async function createShortURL(longURL: string) {
  if (longURL.length < 5 || longURL.length > 2048 || !isValidHttpURL(longURL))
    return REDIS_ERRORS.DATA_VALIDATION_ERROR;

  const redisClient = await RedisDB.getClient();
  if (!(redisClient && redisClient.isOpen)) throw Error(REDIS_ERRORS.REDIS_CLIENT_ERROR);

  var status = false;
  var shortURL: string;
  var lenght = 7;
  var numberOfRetries = 0;

  do {
    shortURL = makeid(lenght + Math.floor(numberOfRetries / 3));
    status = await redisClient.SETNX(REDIS_NAME_PATTERNS.WEB_LINK_PRETAG + shortURL, longURL);
    numberOfRetries++;
  } while (status !== true && numberOfRetries <= 6);

  if (numberOfRetries > 6) throw Error(REDIS_ERRORS.REDIS_DB_WRITE_ERROR);

  const envType = process.env.NODE_ENV;

  const includeHTTPProtocol = process.env.SHORT_URL_INCLUDE_HTTP_PROTOCOL === "true";

  if (envType !== "production") {
    return (
      (includeHTTPProtocol ? "http://" : "") +
      (process.env.SERVER_DOMAIN_NAME + ":" + process.env.SERVER_PORT + "/") +
      shortURL
    );
  } else {
    return (includeHTTPProtocol ? "https://" : "") + process.env.SERVER_DOMAIN_NAME + "/" + shortURL;
  }
}

export async function getDestinationURL(inputURL: string) {
  try {
    const redisClient = await RedisDB.getClient();
    if (!(redisClient && redisClient.isOpen)) throw Error(REDIS_ERRORS.REDIS_CLIENT_ERROR);

    let dbResponse = await redisClient.GET(REDIS_NAME_PATTERNS.WEB_LINK_PRETAG + inputURL);
    let destionationURL = dbResponse ? dbResponse : "/";
    return destionationURL;
  } catch (e) {
    throw Error(REDIS_ERRORS.REDIS_CLIENT_ERROR);
  }
}

function makeid(length: number) {
  const BUFFER_SIZE = 512;
  if (!length || typeof length !== "number") throw new Error('base62 length must be a number "' + length + '"');
  let str = "";

  if (str.length < length)
    str = randomBytes(BUFFER_SIZE)
      .toString("base64")
      .replace(/[+.=/]/g, "");

  let startIdx = Math.floor(Math.random() * (BUFFER_SIZE / 2));
  return str.slice(startIdx, startIdx + length);
}
