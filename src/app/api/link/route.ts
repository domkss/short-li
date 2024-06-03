import "server-only";
import { NextRequest } from "next/server";
import { createShortURL, deleteShortURL, getAllUserLinks, setLinkCustomName } from "@/lib/server/api-functions";
import { REDIS_ERRORS } from "@/lib/server/serverConstants";
import { getServerSession } from "next-auth";
import authOptions from "../auth/[...nextauth]/authOptions";
import { shortURLSchema, longURLSchema } from "@/lib/client/dataValidations";
import { StatusCodes as HTTPStatusCode } from "http-status-codes";
import { isSessionWithEmail } from "@/lib/client/dataValidations";
import { getToken } from "next-auth/jwt";
import { sessionFromToken } from "@/lib/server/serverHelperFunctions";

/**
 * @swagger
 * /api/link:
 *   post:
 *     description: Creates Short URL pointing to the target address
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               url:
 *                 type: string
 *                 example: https://google.com
 *     responses:
 *       200:
 *         description: A JSON response containing the shortened link
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 url:
 *                   type: string
 *                   example: sli.ink/xYGe
 *       400:
 *         description: Incorrect request body param url is missing
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *       401:
 *         description: The session or the JWT expired
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 */

export async function POST(req: NextRequest) {
  const content = await req.json();
  const parsedContent = longURLSchema.safeParse(content);
  if (!parsedContent.success) return Response.json({ success: false }, { status: HTTPStatusCode.BAD_REQUEST });

  // Get Session from cookies if the user is authenticated
  let session = await getServerSession(authOptions);

  // Retrieve session data from the Authorization header, which contains a Bearer JWT token from a third-party application.
  const token = await getToken({ req });
  if (!session && token) {
    session = sessionFromToken(token);
  }

  if (!session || isSessionWithEmail(session)) {
    let success = true;

    let shortURL = await createShortURL(parsedContent.data.url, { session: session }).catch((error) => {
      success = false;
      return error.message;
    });

    return Response.json({
      success: success,
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
