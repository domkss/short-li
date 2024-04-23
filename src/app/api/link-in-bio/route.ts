import "server-only";
import { NextRequest } from "next/server";
import { StatusCodes as HTTPStatusCode } from "http-status-codes";
import {
  getCurrentUserLinkInBioPageId,
  getLinkInBioDescription,
  getLinkInBioLinkButtons,
} from "@/lib/server/api-functions";
import { getServerSession } from "next-auth";
import authOptions from "../auth/[...nextauth]/authOptions";
import { formatShortLink } from "@/lib/server/serverHelperFunctions";

//Get User Links
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);

  const searchParams = req.nextUrl.searchParams;
  let pageId = searchParams.get("id");

  if (!pageId && session) {
    try {
      pageId = await getCurrentUserLinkInBioPageId(session);
    } catch (_) {
      return Response.json({ success: false }, { status: HTTPStatusCode.INTERNAL_SERVER_ERROR });
    }
  } else if (!pageId) {
    return Response.json({ success: false }, { status: HTTPStatusCode.BAD_REQUEST });
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
