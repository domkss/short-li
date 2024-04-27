import "server-only";
import { NextRequest } from "next/server";
import { createShortURL, deleteShortURL, getAllUserLinks, setLinkCustomName } from "@/lib/server/api-functions";
import { REDIS_ERRORS } from "@/lib/server/serverConstants";
import { getServerSession } from "next-auth";
import authOptions from "../auth/[...nextauth]/authOptions";
import { shortURLSchema, urlSchema } from "@/lib/client/dataValidations";
import { StatusCodes as HTTPStatusCode } from "http-status-codes";
import { isSessionWithEmail } from "@/lib/client/dataValidations";

//Create Short URL
export async function POST(req: NextRequest) {
  const content = await req.json();
  const parsedContent = urlSchema.safeParse(content);
  if (!parsedContent.success) return Response.json({ success: false }, { status: HTTPStatusCode.BAD_REQUEST });

  const session = await getServerSession(authOptions);

  if (!session || isSessionWithEmail(session)) {
    let shortURL = await createShortURL(parsedContent.data.url, { session: session }).catch(
      (error: REDIS_ERRORS) => error,
    );
    return Response.json({
      success: true,
      url: shortURL,
    });
  } else {
    return Response.json({ success: false }, { status: HTTPStatusCode.UNAUTHORIZED });
  }
}

//Get User Links
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || !isSessionWithEmail(session))
    return Response.json({ success: false }, { status: HTTPStatusCode.UNAUTHORIZED });

  const searchParams = req.nextUrl.searchParams;
  const linkId = searchParams.get("linkId");
  if (linkId) {
    //Return not yet implemented error,
    //until it will be required on some point to implement a single link data request endpoint
    return Response.json({ success: false }, { status: HTTPStatusCode.NOT_IMPLEMENTED });
  } else {
    let userLinks = await getAllUserLinks(session);
    return Response.json({ success: true, link_data_list: userLinks });
  }
}

//Delete User Link
export async function DELETE(req: NextRequest) {
  const content = await req.json();
  const parsedContent = shortURLSchema.safeParse(content);
  if (!parsedContent.success || !parsedContent.data.url)
    return Response.json({ success: false }, { status: HTTPStatusCode.BAD_REQUEST });

  const session = await getServerSession(authOptions);
  if (!isSessionWithEmail(session)) return Response.json({ success: false }, { status: HTTPStatusCode.UNAUTHORIZED });

  try {
    await deleteShortURL(parsedContent.data.url, session);
    return Response.json({
      success: true,
    });
  } catch (e) {
    let errorMessage = REDIS_ERRORS.REDIS_CLIENT_ERROR.toString();

    if (e instanceof Error) errorMessage = e.message;

    return Response.json(
      {
        success: false,
        error: errorMessage,
      },
      { status: HTTPStatusCode.BAD_REQUEST },
    );
  }
}

//Update User Link Custom Name
export async function PATCH(req: NextRequest) {
  const content = await req.json();
  const parsedContent = shortURLSchema.safeParse(content);
  if (!parsedContent.success || !parsedContent.data.url || !parsedContent.data.new_custom_name)
    return Response.json({ success: true }, { status: HTTPStatusCode.INTERNAL_SERVER_ERROR });

  const session = await getServerSession(authOptions);
  if (!isSessionWithEmail(session)) return Response.json({ success: false }, { status: HTTPStatusCode.UNAUTHORIZED });
  try {
    let result = setLinkCustomName(parsedContent.data.url, parsedContent.data.new_custom_name, session);
    if (!result) return Response.json({ success: false }, { status: HTTPStatusCode.INTERNAL_SERVER_ERROR });
    else return Response.json({ success: true }, { status: HTTPStatusCode.OK });
  } catch (_) {
    return Response.json({ success: false }, { status: HTTPStatusCode.INTERNAL_SERVER_ERROR });
  }
}
