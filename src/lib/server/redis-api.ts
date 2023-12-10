"use server";
import { RedisDB } from "./redisDB";
import { RedisClientError } from "./errorCodes";
import { isValidHttpURL } from "../helperFunctions";

export async function createShortURL(longURL: string) {
  if (longURL.length < 5 || !isValidHttpURL(longURL)) return RedisClientError.DATA_VALIDATION_ERROR;

  const redisClient = await RedisDB.getClient();
  if (!(redisClient && redisClient.isOpen)) throw Error(RedisClientError.REDIS_CLIENT_ERROR);

  var status = false;
  var shortURL: string;
  var lenght = 7;
  var numberOfRetries = 0;

  do {
    shortURL = makeid(lenght + Math.floor(numberOfRetries / 3));
    status = await redisClient.SETNX(shortURL, longURL);
    numberOfRetries++;
  } while (status !== true && numberOfRetries <= 6);

  if (numberOfRetries > 6) throw Error(RedisClientError.REDIS_DB_WRITE_ERROR);

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
    if (!(redisClient && redisClient.isOpen)) throw Error(RedisClientError.REDIS_CLIENT_ERROR);

    let dbResponse = await redisClient.GET(inputURL);
    let destionationURL = dbResponse ? dbResponse : "/";
    return destionationURL;
  } catch (e) {
    throw Error(RedisClientError.REDIS_CLIENT_ERROR);
  }
}

var BUFFER_SIZE = 512;
var crypto = require("crypto");

function makeid(length: number) {
  if (!length || typeof length !== "number") throw new Error('base62 length must be a number "' + length + '"');
  let str = "";

  if (str.length < length) str = generateBase62Node();

  let startIdx = Math.floor(Math.random() * (BUFFER_SIZE / 2));
  return str.slice(startIdx, startIdx + length);
}

function generateBase62Node() {
  return crypto
    .randomBytes(BUFFER_SIZE)
    .toString("base64")
    .replace(/[+.=/]/g, "");
}
