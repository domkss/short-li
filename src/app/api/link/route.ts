import { NextRequest } from "next/server";
import { createShortURL, deleteShortURL, getAllUserLinks } from "@/lib/server/api-functions";
import { REDIS_ERRORS } from "@/lib/server/serverConstants";
import { getServerSession } from "next-auth";
import authOptions from "../auth/[...nextauth]/authOptions";
import { shortURLSchema, urlSchema } from "@/lib/helperFunctions";

export async function POST(req: NextRequest) {
  const content = await req.json();
  const parsedContent = urlSchema.safeParse(content);
  if (!parsedContent.success) return Response.json({ success: false }, { status: 400 });

  const session = await getServerSession(authOptions);

  try {
    let shortURL = await createShortURL(parsedContent.data.url, { session: session }).catch(
      (error: REDIS_ERRORS) => error,
    );
    return Response.json({
      success: true,
      url: shortURL,
    });
  } catch (_) {
    return Response.json(
      {
        success: false,
      },
      { status: 400 },
    );
  }
}

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return Response.json({ success: false }, { status: 401 });

  const searchParams = req.nextUrl.searchParams;
  const linkId = searchParams.get("linkId");
  if (linkId) {
    //Return not yet implemented error,
    //until it will be required on some point to implement a single link data request endpoint
    return Response.json({ success: false }, { status: 501 });
  } else {
    let userLinks = await getAllUserLinks(session);
    return Response.json({ success: true, linkDataList: userLinks });
  }
}

export async function DELETE(req: NextRequest) {
  const content = await req.json();
  const parsedContent = shortURLSchema.safeParse(content);
  if (!parsedContent.success) return Response.json({ success: false }, { status: 400 });
  if (!parsedContent.data.url) return Response.json({ success: false }, { status: 400 });

  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return Response.json({ success: false }, { status: 401 });

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
      { status: 400 },
    );
  }
}
