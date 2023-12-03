"use server";

import { stat } from "fs";
import { RedisDB } from "./redisDB";

export async function createShortURL(longURL: string) {
  const redisClient = await RedisDB.getClient();
  var status = false;
  var shortURL: string;
  var lenght = 5;
  var numberOfRetrys = 0;

  do {
    shortURL = makeid(lenght + Math.floor(numberOfRetrys / 3));
    status = await redisClient.SETNX(shortURL, longURL);
    numberOfRetrys++;
  } while (status !== true && numberOfRetrys <= 20);

  if (numberOfRetrys > 20) throw Error("Can't save the URL to the database");

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
