import { z } from "zod";
import clsx, { ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/* Class Name concatenation with tailwindMerge and clsx */
export const cn = (...classes: ClassValue[]) => twMerge(clsx(...classes));

/*Data validation checkers */
export function isValidHttpURL(input: string) {
  try {
    new URL(input);
    return true;
  } catch (_) {
    return false;
  }
}

export const emailSchema = z
  .string()
  .regex(
    /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
    "Invalid email address",
  );

const passwordSchema = z.string().min(8, "Password should be minimum 8 character");

export const loginUserSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Empty password is not allowed"),
});

export const registerUserSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  reCaptchaTokken: z.string().optional(),
});

export const urlSchema = z.object({
  url: z.string().min(1),
});

export const shortURLSchema = z.object({
  url: z
    .string()
    .min(1)
    .transform((string) => string.split("/").pop()),
});

/*Utility functions */
export function addHttpstoURL(input: string): string {
  if (!(input.startsWith("https://") || input.startsWith("http://"))) return "https://" + input;
  return input;
}

export function generateVisiblePaginationButtonKeys(originalArray: number[], currentPage: number) {
  const quarterPoint = Math.floor(originalArray.length / 5);

  const currentPageNumber = originalArray.indexOf(currentPage);

  const newArray = [
    originalArray[0],
    originalArray[originalArray.length - 1],

    originalArray[quarterPoint],
    originalArray[quarterPoint * 2],
    originalArray[quarterPoint * 3],
    originalArray[quarterPoint * 4],

    originalArray[currentPageNumber - 1],
    originalArray[currentPageNumber],
    originalArray[currentPageNumber + 1],
  ];

  return newArray;
}

export const debounce = (fn: Function, ms = 300) => {
  let timeoutId: ReturnType<typeof setTimeout>;
  return function (this: any, ...args: any[]) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn.apply(this, args), ms);
  };
};

export function nFormatter(num: number | undefined, digits: number) {
  if (!num) return 0;

  const lookup = [
    { value: 1, symbol: "" },
    { value: 1e3, symbol: "k" },
    { value: 1e6, symbol: "M" },
    { value: 1e9, symbol: "G" },
    { value: 1e12, symbol: "T" },
    { value: 1e15, symbol: "P" },
    { value: 1e18, symbol: "E" },
  ];
  const rx = /\.0+$|(\.[0-9]*[1-9])0+$/;
  var item = lookup
    .slice()
    .reverse()
    .find(function (item) {
      return num >= item.value;
    });
  return item ? (num / item.value).toFixed(digits).replace(rx, "$1") + item.symbol : "0";
}

/* Calculates progress precentage until reaching the nearest power of 10 above the input parameter*/
export function progressUntilNextPowerOfTen(input: number | undefined) {
  if (!input) return 0;
  let precentage = (input / 10 ** (Math.floor(Math.log10(input)) + 1)) * 100;
  return precentage;
}
