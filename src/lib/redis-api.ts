"use server";
import { RedisDB } from "./redisDB";
import { RedisClientError } from "./errorCodes";
import { isValidHttpURL } from "./helperFunctions";

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

  return "https://" + process.env.SERVER_DOMAIN_NAME + "/" + shortURL;
}

function makeid(length: number) {
  let result = "";
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const charactersLength = characters.length;
  let counter = 0;
  while (counter < length) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
    counter += 1;
  }
  return result;
}
