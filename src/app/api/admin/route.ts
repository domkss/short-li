import { getServerSession } from "next-auth";
import { NextRequest } from "next/server";
import authOptions from "../auth/[...nextauth]/authOptions";
import { isSessionWithEmail } from "@/lib/client/dataValidations";
import { StatusCodes as HTTPStatusCode } from "http-status-codes";
import { Role } from "@/lib/common/Types";
import { getAllShortLinkData, getAllUserEmail } from "@/lib/server/api-functions";

//Get Admin Dashboard Data
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session || !isSessionWithEmail(session) || !session.user.role.includes(Role.Admin))
    return Response.json({ success: false }, { status: HTTPStatusCode.UNAUTHORIZED });

  let userEmails = await getAllUserEmail(session);
  let shortLinksData = await getAllShortLinkData(session);

  return Response.json({ success: true, all_short_links_data: shortLinksData, user_emails: userEmails });
}
