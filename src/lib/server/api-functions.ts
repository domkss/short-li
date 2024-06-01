import "server-only";
import RedisDB from "./redisDB";
import { REDIS_ERRORS, REDIS_NAME_PATTERNS, REDIS_LINK_FIELDS, REDIS_BIO_FIELDS } from "./serverConstants";
import { isValidHttpURL } from "../client/dataValidations";
import { RedisClientType } from "redis";
import GeoLocationService from "./GeoLocationService";
import { getRandomBase58String, formatShortLink } from "./serverHelperFunctions";
import { LinkListItemType, Promisify, LinkInBioButtonItem, CreateShortURLOptions, Role } from "../common/Types";
import { REDIS_USER_FIELDS } from "./serverConstants";
import { SessionWithEmail } from "../common/Types";

//#region Link related CRUD functions
export async function createShortURL(longURL: string, options: CreateShortURLOptions) {
  if (longURL.length < 5 || longURL.length > 2048 || !isValidHttpURL(longURL))
    return REDIS_ERRORS.DATA_VALIDATION_ERROR;

  const redisClient = await RedisDB.getClient();
  if (!(redisClient && redisClient.isOpen)) throw Error(REDIS_ERRORS.REDIS_CLIENT_ERROR);

  let status = false;
  let shortURL: string;
  let lenght = 4;
  let numberOfRetries = 0;

  do {
    shortURL = getRandomBase58String(lenght + Math.floor(numberOfRetries / 2));
    status = await redisClient.HSETNX(REDIS_NAME_PATTERNS.LINK_PRETAG + shortURL, REDIS_LINK_FIELDS.TARGET, longURL);
    numberOfRetries++;
  } while (status !== true && numberOfRetries <= 8);

  if (status !== true) throw Error(REDIS_ERRORS.REDIS_DB_WRITE_ERROR);

  if (options.session && options.session.user?.email) {
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

export async function getAllUserLinks(session: SessionWithEmail) {
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

export async function deleteShortURL(shortURL: string, session: SessionWithEmail) {
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

export async function setLinkCustomName(shortURL: string, newCustomName: string, session: SessionWithEmail) {
  const redisClient = await RedisDB.getClient();
  if (!(redisClient && redisClient.isOpen)) throw Error(REDIS_ERRORS.REDIS_CLIENT_ERROR);

  let userShortURLs = await redisClient.SMEMBERS(REDIS_NAME_PATTERNS.USER_LINKS + session.user?.email);
  if (!userShortURLs.includes(shortURL)) throw Error(REDIS_ERRORS.ACCESS_DENIED_ERROR);

  let status = redisClient.HSET(REDIS_NAME_PATTERNS.LINK_PRETAG + shortURL, REDIS_LINK_FIELDS.NAME, newCustomName);
  if (!status) throw Error(REDIS_ERRORS.REDIS_DB_WRITE_ERROR);

  return status;
}
//#endregion

//#region Link-in-Bio Page CRUD functions
export async function getCurrentUserLinkInBioPageId(session: SessionWithEmail) {
  const redisClient = await RedisDB.getClient();
  if (!(redisClient && redisClient.isOpen)) throw Error(REDIS_ERRORS.REDIS_CLIENT_ERROR);

  let pageId = await redisClient.HGET(
    REDIS_NAME_PATTERNS.USER_PRETAG + session.user?.email,
    REDIS_USER_FIELDS.BIO_PAGE_ID,
  );

  if (!pageId) {
    let status = false;
    let lenght = 4;
    let numberOfRetries = 0;

    do {
      pageId = getRandomBase58String(lenght + Math.floor(numberOfRetries / 2));

      await redisClient.HSETNX(REDIS_NAME_PATTERNS.BIO_PRETAG + pageId, REDIS_BIO_FIELDS.DESCRIPTION, "Description");
      status = await redisClient.HSETNX(REDIS_NAME_PATTERNS.BIO_PRETAG + pageId, REDIS_BIO_FIELDS.IN_USE, "1");
      numberOfRetries++;
    } while (status !== true && numberOfRetries <= 8);

    if (status !== true) throw Error(REDIS_ERRORS.REDIS_DB_WRITE_ERROR);
    await redisClient.HSETNX(
      REDIS_NAME_PATTERNS.USER_PRETAG + session.user?.email,
      REDIS_USER_FIELDS.BIO_PAGE_ID,
      pageId,
    );
  } else {
    await redisClient.HSETNX(REDIS_NAME_PATTERNS.BIO_PRETAG + pageId, REDIS_BIO_FIELDS.IN_USE, "1");
  }

  return pageId;
}

export async function isPageIdExists(pageId: string): Promise<boolean> {
  const redisClient = await RedisDB.getClient();
  if (!(redisClient && redisClient.isOpen)) throw Error(REDIS_ERRORS.REDIS_CLIENT_ERROR);
  let result = await redisClient.HGET(REDIS_NAME_PATTERNS.BIO_PRETAG + pageId, REDIS_BIO_FIELDS.IN_USE);

  return result === "1";
}

export async function getLinkInBioDescription(pageId: string) {
  const redisClient = await RedisDB.getClient();
  if (!(redisClient && redisClient.isOpen)) throw Error(REDIS_ERRORS.REDIS_CLIENT_ERROR);

  return redisClient.HGET(REDIS_NAME_PATTERNS.BIO_PRETAG + pageId, REDIS_BIO_FIELDS.DESCRIPTION);
}

export async function setLinkInBioDescription(newDescription: string, session: SessionWithEmail) {
  let pageId = await getCurrentUserLinkInBioPageId(session);

  const redisClient = await RedisDB.getClient();
  if (!(redisClient && redisClient.isOpen)) throw Error(REDIS_ERRORS.REDIS_CLIENT_ERROR);

  await redisClient.HSET(REDIS_NAME_PATTERNS.BIO_PRETAG + pageId, REDIS_BIO_FIELDS.DESCRIPTION, newDescription);

  return true;
}

export async function getLinkInBioLinkButtons(pageId: string) {
  const redisClient = await RedisDB.getClient();
  if (!(redisClient && redisClient.isOpen)) throw Error(REDIS_ERRORS.REDIS_CLIENT_ERROR);

  let linkButtonList: LinkInBioButtonItem[] = [];

  let buttonIDsOrderedJSONString = await redisClient.HGET(
    REDIS_NAME_PATTERNS.BIO_PRETAG + pageId,
    REDIS_BIO_FIELDS.BUTTON_ID_LIST,
  );
  if (!buttonIDsOrderedJSONString) return [];

  let buttonIDsOrderedArray: Number[] = JSON.parse(buttonIDsOrderedJSONString);

  for (let item_id of buttonIDsOrderedArray) {
    let buttonJSONString = await redisClient.HGET(
      REDIS_NAME_PATTERNS.BIO_PRETAG + pageId,
      REDIS_BIO_FIELDS.BUTTON + item_id,
    );

    if (!buttonJSONString) continue;

    let button: LinkInBioButtonItem = JSON.parse(buttonJSONString);
    linkButtonList.push(button);
  }

  return linkButtonList;
}

export async function setLinkInBioLinkButtons(
  linkInBioButtonList: LinkInBioButtonItem[],
  session: SessionWithEmail,
): Promise<boolean> {
  let pageId = await getCurrentUserLinkInBioPageId(session);

  const redisClient = await RedisDB.getClient();
  if (!(redisClient && redisClient.isOpen)) throw Error(REDIS_ERRORS.REDIS_CLIENT_ERROR);

  for (let button of linkInBioButtonList) {
    await redisClient.HSET(
      REDIS_NAME_PATTERNS.BIO_PRETAG + pageId,
      REDIS_BIO_FIELDS.BUTTON + button.id,
      JSON.stringify(button),
    );
  }

  let Old_Button_IDs_List_JSON_String = await redisClient.HGET(
    REDIS_NAME_PATTERNS.BIO_PRETAG + pageId,
    REDIS_BIO_FIELDS.BUTTON_ID_LIST,
  );

  let New_Button_IDs_List = linkInBioButtonList.map((item) => item.id);

  await redisClient.HSET(
    REDIS_NAME_PATTERNS.BIO_PRETAG + pageId,
    REDIS_BIO_FIELDS.BUTTON_ID_LIST,
    JSON.stringify(New_Button_IDs_List),
  );

  //Delete removed items from the hash
  if (Old_Button_IDs_List_JSON_String) {
    let Old_Button_IDs_List: number[] = JSON.parse(Old_Button_IDs_List_JSON_String);

    let deletedItemIds = Old_Button_IDs_List.filter((item) => !New_Button_IDs_List.includes(item));

    for (let item_id of deletedItemIds) {
      await redisClient.HDEL(REDIS_NAME_PATTERNS.BIO_PRETAG + pageId, REDIS_BIO_FIELDS.BUTTON + item_id);
    }
  }
  return true;
}

export async function getLinkInBioAvatar(pageId: string): Promise<string | undefined> {
  const redisClient = await RedisDB.getClient();
  if (!(redisClient && redisClient.isOpen)) throw Error(REDIS_ERRORS.REDIS_CLIENT_ERROR);

  return redisClient.HGET(REDIS_NAME_PATTERNS.BIO_PRETAG + pageId, REDIS_BIO_FIELDS.AVATAR);
}

export async function setLinkInBioAvatar(base58EncodedImage: string, session: SessionWithEmail) {
  let pageId = await getCurrentUserLinkInBioPageId(session);

  const redisClient = await RedisDB.getClient();
  if (!(redisClient && redisClient.isOpen)) throw Error(REDIS_ERRORS.REDIS_CLIENT_ERROR);
  await redisClient.HSET(REDIS_NAME_PATTERNS.BIO_PRETAG + pageId, REDIS_BIO_FIELDS.AVATAR, base58EncodedImage);

  return true;
}

//#endregion

//#region Admin Functions

async function getAllUserEmail(session: SessionWithEmail) {
  const redisClient = await RedisDB.getClient();
  if (!(redisClient && redisClient.isOpen)) throw Error(REDIS_ERRORS.REDIS_CLIENT_ERROR);
}

async function getAllShortLinkData(session: SessionWithEmail) {
  //Throw error if the user is not an Admin
  if (!session.user.role.includes(Role.Admin)) throw Error(REDIS_ERRORS.ACCESS_DENIED_ERROR);

  const redisClient = await RedisDB.getClient();
  if (!(redisClient && redisClient.isOpen)) throw Error(REDIS_ERRORS.REDIS_CLIENT_ERROR);

  let cursor = 0;
  const shortLinks: string[] = [];

  do {
    let results = await redisClient.SCAN(0, {
      MATCH: "link:*",
      COUNT: 1000,
    });

    cursor = results.cursor;
    const keys: string[] = results.keys;

    keys.forEach((key) => {
      // Check if the key contains another colon after 'link:'
      if (!key.includes(":", 5)) {
        // Skip the first 5 characters 'link:'
        shortLinks.push(key);
      }
    });
  } while (cursor !== 0);

  let linkList: Promisify<LinkListItemType>[] = [];

  for (const shortURL of shortLinks) {
    let name = redisClient.HGET(REDIS_NAME_PATTERNS.LINK_PRETAG + shortURL, REDIS_LINK_FIELDS.NAME);
    let target_url = redisClient.HGET(REDIS_NAME_PATTERNS.LINK_PRETAG + shortURL, REDIS_LINK_FIELDS.TARGET);
    let redirect_count = redisClient.HGET(
      REDIS_NAME_PATTERNS.LINK_PRETAG + shortURL,
      REDIS_LINK_FIELDS.REDIRECT_COUNTER,
    );

    linkList.push({
      shortURL: Promise.resolve(formatShortLink(shortURL)),
      name: name,
      target_url: target_url,
      redirect_count: redirect_count,
      click_by_country: Promise.resolve([]),
    });
  }

  const arrayOfPromises: Promise<{ [key: string]: any }>[] = linkList.map((obj) =>
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

//#endregion

//Helper functions
async function saveRedirectedUserCountryCode(redisClient: RedisClientType, shortURL: string, ip: string) {
  let countryCode = await GeoLocationService.getCountry(ip);
  redisClient.ZINCRBY(REDIS_NAME_PATTERNS.STATISTIC_COUNTRY_CODE + shortURL, 1, countryCode);
}
