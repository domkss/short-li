import "server-only";
import RedisDB from "./redisDB";
import { REDIS_ERRORS, REDIS_NAME_PATTERNS, REDIS_LINK_FIELDS } from "./serverConstants";
import { isValidHttpURL } from "../client/dataValidations";
import { DefaultSession } from "next-auth";
import { RedisClientType } from "redis";
import GeoLocationService from "./GeoLocationService";
import { getRandomBase58String, formatShortLink } from "./serverHelperFunctions";
import { LinkListItemType, Promisify } from "../common/Types";

//Todo: Implement advanced link creation with more options
type createShortURLOptions = {
  session: DefaultSession | null;
  linkCustomName?: string;
};

/*Link related CRUD functions */
export async function createShortURL(longURL: string, options: createShortURLOptions) {
  if (longURL.length < 5 || longURL.length > 2048 || !isValidHttpURL(longURL))
    return REDIS_ERRORS.DATA_VALIDATION_ERROR;

  const redisClient = await RedisDB.getClient();
  if (!(redisClient && redisClient.isOpen)) throw Error(REDIS_ERRORS.REDIS_CLIENT_ERROR);

  var status = false;
  var shortURL: string;
  var lenght = 4;
  var numberOfRetries = 0;

  do {
    shortURL = getRandomBase58String(lenght + Math.floor(numberOfRetries / 2));
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
  } while (status !== true && numberOfRetries <= 8);

  if (numberOfRetries > 6) throw Error(REDIS_ERRORS.REDIS_DB_WRITE_ERROR);

  return formatShortLink(shortURL);
}

export async function getDestinationURL(shortURL: string, ip?: string) {
  const redisClient = await RedisDB.getClient();
  if (!(redisClient && redisClient.isOpen)) throw Error(REDIS_ERRORS.REDIS_CLIENT_ERROR);
  try {
    let targetURL = await redisClient.HGET(REDIS_NAME_PATTERNS.LINK_PRETAG + shortURL, REDIS_LINK_FIELDS.TARGET);
    let tracked = await redisClient.HGET(REDIS_NAME_PATTERNS.LINK_PRETAG + shortURL, REDIS_LINK_FIELDS.TRACKED);
    if (targetURL && tracked) {
      redisClient.HINCRBY(REDIS_NAME_PATTERNS.LINK_PRETAG + shortURL, REDIS_LINK_FIELDS.REDIRECT_COUNTER, 1);
      if (ip) saveRedirectedUserCountryCode(redisClient, shortURL, ip);
    }
    let destionationURL = targetURL ? targetURL : "/";
    return destionationURL;
  } catch (e) {
    throw Error(REDIS_ERRORS.REDIS_CLIENT_ERROR);
  }
}

export async function getAllUserLinks(session: DefaultSession) {
  const redisClient = await RedisDB.getClient();
  if (!(redisClient && redisClient.isOpen)) throw Error(REDIS_ERRORS.REDIS_CLIENT_ERROR);
  let userShortURLs = await redisClient.SMEMBERS(REDIS_NAME_PATTERNS.USER_LINKS + session.user?.email);
  let userLinkList: Promisify<LinkListItemType>[] = [];

  for (const shortURL of userShortURLs) {
    let name = redisClient.HGET(REDIS_NAME_PATTERNS.LINK_PRETAG + shortURL, REDIS_LINK_FIELDS.NAME);
    let target_url = redisClient.HGET(REDIS_NAME_PATTERNS.LINK_PRETAG + shortURL, REDIS_LINK_FIELDS.TARGET);
    let redirect_count = redisClient.HGET(
      REDIS_NAME_PATTERNS.LINK_PRETAG + shortURL,
      REDIS_LINK_FIELDS.REDIRECT_COUNTER,
    );
    let click_by_country = redisClient.ZRANGE_WITHSCORES(REDIS_NAME_PATTERNS.STATISTIC_COUNTRY_CODE + shortURL, 0, -1);

    userLinkList.push({
      shortURL: Promise.resolve(formatShortLink(shortURL)),
      name: name,
      target_url: target_url,
      redirect_count: redirect_count,
      click_by_country: click_by_country,
    });
  }

  const arrayOfPromises: Promise<{ [key: string]: any }>[] = userLinkList.map((obj) =>
    Promise.all(Object.values(obj)).then((resolvedValues: any[]) => {
      const resolvedObject: { [key: string]: any } = {};
      Object.keys(obj).forEach((key, index) => {
        resolvedObject[key] = resolvedValues[index];
      });
      return resolvedObject;
    }),
  );
  return (await Promise.all(arrayOfPromises)) as LinkListItemType[];
}

export async function deleteShortURL(shortURL: string, session: DefaultSession) {
  const redisClient = await RedisDB.getClient();
  if (!(redisClient && redisClient.isOpen)) throw Error(REDIS_ERRORS.REDIS_CLIENT_ERROR);

  let userShortURLs = await redisClient.SMEMBERS(REDIS_NAME_PATTERNS.USER_LINKS + session.user?.email);
  if (!userShortURLs.includes(shortURL)) throw Error(REDIS_ERRORS.ACCESS_DENIED_ERROR);

  let status = await redisClient
    .MULTI()
    .DEL(REDIS_NAME_PATTERNS.LINK_PRETAG + shortURL)
    .DEL(REDIS_NAME_PATTERNS.STATISTIC_COUNTRY_CODE + shortURL)
    .SREM(REDIS_NAME_PATTERNS.USER_LINKS + session.user?.email, shortURL)
    .EXEC(true);

  return status;
}

export async function updateLinkCustomName(shortURL: string, newCustomName: string, session: DefaultSession) {
  const redisClient = await RedisDB.getClient();
  if (!(redisClient && redisClient.isOpen)) throw Error(REDIS_ERRORS.REDIS_CLIENT_ERROR);

  let userShortURLs = await redisClient.SMEMBERS(REDIS_NAME_PATTERNS.USER_LINKS + session.user?.email);
  if (!userShortURLs.includes(shortURL)) throw Error(REDIS_ERRORS.ACCESS_DENIED_ERROR);

  let status = redisClient.HSET(REDIS_NAME_PATTERNS.LINK_PRETAG + shortURL, REDIS_LINK_FIELDS.NAME, newCustomName);
  if (!status) throw Error(REDIS_ERRORS.REDIS_DB_WRITE_ERROR);

  return status;
}

/*Helper functions */
async function saveRedirectedUserCountryCode(redisClient: RedisClientType, shortURL: string, ip: string) {
  let countryCode = await GeoLocationService.getCountry(ip);
  redisClient.ZINCRBY(REDIS_NAME_PATTERNS.STATISTIC_COUNTRY_CODE + shortURL, 1, countryCode);
}
