import { NextRequest } from "next/server";
import { createShortURL } from "@/lib/server/api-functions";
import { REDIS_ERRORS } from "@/lib/server/serverConstants";

export async function POST(req: NextRequest) {
  const content = await req.json();
  try {
    let shortURL = await createShortURL(content.url).catch((error: REDIS_ERRORS) => error);
    return Response.json({
      success: true,
      url: shortURL,
    });
  } catch (_) {
    return Response.json(
      {
        success: false,
      },
      { status: 400 }
    );
  }
}

/*
export async function GET(req: NextRequest) {
  const content = await req.json();
  console.log(content);
}*/
