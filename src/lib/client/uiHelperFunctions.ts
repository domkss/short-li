import clsx, { ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/* Class Name concatenation with tailwindMerge and clsx */
export const cn = (...classes: ClassValue[]) => twMerge(clsx(...classes));

/*Utility functions */
export const debounce = (fn: Function, ms = 300) => {
  let timeoutId: ReturnType<typeof setTimeout>;
  return function (this: any, ...args: any[]) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn.apply(this, args), ms);
  };
};

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