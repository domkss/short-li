"use server";
import { getDestinationURL } from "@/lib/server/api-functions";
import { redirect } from "next/navigation";
import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  const ip = (req.headers.get("x-forwarded-for") || "").split(",").shift()?.trim();

  let shortURL = req.nextUrl.pathname.substring(1);
  if (shortURL) {
    let destinationURL = encodeQueryParams(await getDestinationURL(shortURL, ip));
    redirect(destinationURL);
  } else {
    redirect("/");
  }
}

function encodeQueryParams(url: string) {
  const [base, queryString] = url.split("?");
  if (!queryString) {
    return url; // No query string to encode
  }

  const encodedParams = queryString
    .split("&")
    .map((param) => {
      const [key, value] = param.split("=");
      return `${encodeURIComponent(key)}=${encodeURIComponent(value)}`;
    })
    .join("&");

  return `${base}?${encodedParams}`;
}
