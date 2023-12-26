import "server-only";
import { RedisDB } from "./redisDB";
import { REDIS_ERRORS, REDIS_NAME_PATTERNS, REDIS_LINK_FIELDS } from "./serverConstants";
import { isValidHttpURL } from "../helperFunctions";
import { randomBytes } from "crypto";
import { DefaultSession } from "next-auth";

type URLCreatorOptions = {
  session: DefaultSession | null;
  linkCustomName?: string;
};

export async function createShortURL(longURL: string, options: URLCreatorOptions) {
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
    status = await redisClient.HSETNX(REDIS_NAME_PATTERNS.LINK_PRETAG + shortURL, REDIS_LINK_FIELDS.TARGET, longURL);
    if (status && options.session && options.session.user?.email) {
      let linkCustomName = options.linkCustomName;
      if (!linkCustomName)
        linkCustomName = `Link ${(
          (await redisClient.SCARD(REDIS_NAME_PATTERNS.USER_LINKS + options.session.user?.email)) + 1
        ).toString()}.`;

      redisClient
        .MULTI()
        .HSETNX(REDIS_NAME_PATTERNS.LINK_PRETAG + shortURL, REDIS_LINK_FIELDS.NAME, linkCustomName)
        .HSETNX(REDIS_NAME_PATTERNS.LINK_PRETAG + shortURL, REDIS_LINK_FIELDS.TRACKED, "1")
        .SADD(REDIS_NAME_PATTERNS.USER_LINKS + options.session.user?.email, shortURL)
        .EXEC(false);
    } else {
      redisClient.EXPIRE(REDIS_NAME_PATTERNS.LINK_PRETAG + shortURL, 15552000);
    }
    numberOfRetries++;
  } while (status !== true && numberOfRetries <= 6);

  if (numberOfRetries > 6) throw Error(REDIS_ERRORS.REDIS_DB_WRITE_ERROR);

  return formatShortLink(shortURL);
}

export async function getDestinationURL(inputURL: string, ip?: string) {
  const redisClient = await RedisDB.getClient();
  if (!(redisClient && redisClient.isOpen)) throw Error(REDIS_ERRORS.REDIS_CLIENT_ERROR);
  try {
    let targetURL = await redisClient.HGET(REDIS_NAME_PATTERNS.LINK_PRETAG + inputURL, REDIS_LINK_FIELDS.TARGET);
    let tracked = await redisClient.HGET(REDIS_NAME_PATTERNS.LINK_PRETAG + inputURL, REDIS_LINK_FIELDS.TRACKED);
    if (targetURL && tracked) {
      redisClient.HINCRBY(REDIS_NAME_PATTERNS.LINK_PRETAG + inputURL, REDIS_LINK_FIELDS.REDIRECT_COUNTER, 1);
      if (ip) redisClient.SADD(REDIS_NAME_PATTERNS.STATISTICAL_IP_ADDRESSES + inputURL, ip);
    }
    let destionationURL = targetURL ? targetURL : "/";
    return destionationURL;
  } catch (e) {
    throw Error(REDIS_ERRORS.REDIS_CLIENT_ERROR);
  }
}

export async function getAllUserLinks(session: DefaultSession) {
  const envType = process.env.NODE_ENV;
  const includeHTTPProtocol = process.env.SHORT_URL_INCLUDE_HTTP_PROTOCOL === "true";

  const redisClient = await RedisDB.getClient();
  if (!(redisClient && redisClient.isOpen)) throw Error(REDIS_ERRORS.REDIS_CLIENT_ERROR);
  let userShortURLs = await redisClient.SMEMBERS(REDIS_NAME_PATTERNS.USER_LINKS + session.user?.email);
  let userLinkList: { [key: string]: Promise<string | undefined> }[] = [];

  for (const shortURL of userShortURLs) {
    let name = redisClient.HGET(REDIS_NAME_PATTERNS.LINK_PRETAG + shortURL, REDIS_LINK_FIELDS.NAME);
    let target_url = redisClient.HGET(REDIS_NAME_PATTERNS.LINK_PRETAG + shortURL, REDIS_LINK_FIELDS.TARGET);
    let redirect_count = redisClient.HGET(
      REDIS_NAME_PATTERNS.LINK_PRETAG + shortURL,
      REDIS_LINK_FIELDS.REDIRECT_COUNTER,
    );
    userLinkList.push({
      shortURL: Promise.resolve(formatShortLink(shortURL)),
      name: name,
      target_url: target_url,
      redirect_count: redirect_count,
    });
  }

  const arrayOfPromises: Promise<{ [key: string]: string | undefined }>[] = userLinkList.map((obj) =>
    Promise.all(Object.values(obj)).then((resolvedValues: any[]) => {
      const resolvedObject: { [key: string]: string | undefined } = {};
      Object.keys(obj).forEach((key, index) => {
        resolvedObject[key] = resolvedValues[index];
      });
      return resolvedObject;
    }),
  );
  return await Promise.all(arrayOfPromises);
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

function formatShortLink(shortURL: string) {
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
