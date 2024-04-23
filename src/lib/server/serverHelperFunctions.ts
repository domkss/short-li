import "server-only";
import { randomBytes } from "crypto";
import base58 from "bs58";
import { RECAPTCHA_ACTIONS } from "./serverConstants";

export function getRandomBase58String(length: number) {
  const BUFFER_SIZE = 512;
  if (!length || typeof length !== "number") throw new Error('base62 length must be a number "' + length + '"');
  let str = "";

  if (str.length < length) str = base58.encode(randomBytes(BUFFER_SIZE));

  let startIdx = Math.floor(Math.random() * (BUFFER_SIZE / 2));
  return str.slice(startIdx, startIdx + length);
}

export function formatShortLink(shortURL: string) {
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

export const verifyRecaptcha = async (token: string, action: RECAPTCHA_ACTIONS) => {
  const secretKey = process.env.RECAPCHA_SECRET_KEY;
  var verificationUrl = "https://www.google.com/recaptcha/api/siteverify?secret=" + secretKey + "&response=" + token;

  let response = await fetch(verificationUrl, {
    method: "POST",
  });

  if (response.ok) {
    let data = await response.json();
    if (data.success && data.score >= 0.5 && data.action === action) {
      return true;
    }
  }
  return false;
};
