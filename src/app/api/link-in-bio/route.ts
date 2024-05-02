import "server-only";
import { NextRequest } from "next/server";
import { StatusCodes as HTTPStatusCode } from "http-status-codes";
import {
  getCurrentUserLinkInBioPageId,
  getLinkInBioDescription,
  getLinkInBioLinkButtons,
  isPageIdInUse,
  setLinkInBioDescription,
  setLinkInBioLinkButtons,
} from "@/lib/server/api-functions";
import { getServerSession } from "next-auth";
import authOptions from "../auth/[...nextauth]/authOptions";
import { formatShortLink } from "@/lib/server/serverHelperFunctions";
import { isSessionWithEmail } from "@/lib/client/dataValidations";
import { linkInBioPatchSchema } from "@/lib/client/dataValidations";
//Get User Links
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);

  const searchParams = req.nextUrl.searchParams;
  let pageId = searchParams.get("id");

  if (!pageId && isSessionWithEmail(session)) {
    try {
      pageId = await getCurrentUserLinkInBioPageId(session);
    } catch (_) {
      return Response.json({ success: false }, { status: HTTPStatusCode.INTERNAL_SERVER_ERROR });
    }
  } else if (!pageId) {
    return Response.json({ success: false }, { status: HTTPStatusCode.BAD_REQUEST });
  }

  let isPageIdExists = await isPageIdInUse(pageId);
  if (!isPageIdExists) {
    return Response.json({ success: false }, { status: HTTPStatusCode.GONE });
  }

  let description = await getLinkInBioDescription(pageId);
  let linkInBioLinkButtons = await getLinkInBioLinkButtons(pageId);

  return Response.json({
    success: true,
    page_url: formatShortLink("s/" + pageId),
    description: description,
    link_buttons: linkInBioLinkButtons,
  });
}

export async function PATCH(req: NextRequest) {
  const content = await req.json();

  const parsedContent = linkInBioPatchSchema.safeParse(content);
  if (!parsedContent.success) return Response.json({ success: false }, { status: HTTPStatusCode.BAD_REQUEST });

  const session = await getServerSession(authOptions);

  if (isSessionWithEmail(session)) {
    if (parsedContent.data.newButtonList) await setLinkInBioLinkButtons(parsedContent.data.newButtonList, session);
    if (typeof parsedContent.data.newDescription === "string")
      await setLinkInBioDescription(parsedContent.data.newDescription, session);

    return Response.json({ success: true });
  } else {
    return Response.json({ success: false }, { status: HTTPStatusCode.UNAUTHORIZED });
  }
}
