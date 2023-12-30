import { randomBytes } from "crypto";

/*Helper functions */
export function makeid(length: number) {
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
