import "server-only";
import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import authOptions from "../../auth/[...nextauth]/authOptions";
import { isSessionWithEmail } from "@/lib/client/dataValidations";
import { StatusCodes as HTTPStatusCode } from "http-status-codes";
import sharp from "sharp";
import {
  getCurrentUserLinkInBioPageId,
  isPageIdExists,
  getLinkInBioAvatar,
  setLinkInBioAvatar,
} from "@/lib/server/api-functions";

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  let pageId = searchParams.get("id");

  if (!pageId) {
    return Response.json({ success: false }, { status: HTTPStatusCode.BAD_REQUEST });
  }

  let pageExists = await isPageIdExists(pageId);
  if (!pageExists) return Response.json({ success: false }, { status: HTTPStatusCode.GONE });

  const base64EncodedImage = await getLinkInBioAvatar(pageId);
  if (!base64EncodedImage) return Response.json({ success: false }, { status: HTTPStatusCode.NOT_FOUND });
  let buffer = decodeBase64Image(base64EncodedImage);

  return new Response(buffer, { status: HTTPStatusCode.OK, headers: { "Content-Type": "image/webp" } });
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (isSessionWithEmail(session)) {
    /* Check if the page still exists and not restricted */
    let pageId = await getCurrentUserLinkInBioPageId(session);
    let pageExists = await isPageIdExists(pageId);
    if (!pageExists) return Response.json({ success: false }, { status: HTTPStatusCode.GONE });

    const formData = await req.formData();
    const file = formData.get("file") as File;
    const data = await file.arrayBuffer();
    const base64EncodedImage = await avatarImageToBase64(data);
    let status = await setLinkInBioAvatar(base64EncodedImage, session);
    return Response.json({ success: status });
  } else {
    return Response.json({ success: false }, { status: HTTPStatusCode.UNAUTHORIZED });
  }
}

async function avatarImageToBase64(data: ArrayBuffer): Promise<string> {
  const resizedBuffer = await sharp(data).resize(96, 98).toFormat("webp", { quality: 60 }).toBuffer();

  const base64String = resizedBuffer.toString("base64");

  return base64String;
}

function decodeBase64Image(input: string): Buffer {
  const buffer = Buffer.from(input, "base64");

  if (typeof buffer === "object") return buffer;
  else throw Error("Error during decoding the base64 string");
}
