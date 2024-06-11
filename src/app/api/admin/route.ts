import { getServerSession } from "next-auth";
import { NextRequest } from "next/server";
import authOptions from "../auth/[...nextauth]/authOptions";
import { emailSchema, isSessionWithEmail, deleteReuqestSchema } from "@/lib/client/dataValidations";
import { StatusCodes as HTTPStatusCode } from "http-status-codes";
import { Role } from "@/lib/common/Types";
import { deleteShortLinkByAdmin, deleteUser, getAllShortLinkData, getAllUserEmail } from "@/lib/server/api-functions";
import { DeleteRequestSchema } from "@/lib/common/Types";

//Get Admin Dashboard Data
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session || !isSessionWithEmail(session) || !session.user.role.includes(Role.Admin))
    return Response.json({ success: false }, { status: HTTPStatusCode.UNAUTHORIZED });

  let userEmails = await getAllUserEmail(session);
  let shortLinksData = await getAllShortLinkData(session);

  return Response.json({ success: true, all_short_links_data: shortLinksData, user_emails: userEmails });
}

//Delete Short Link / User

export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session || !isSessionWithEmail(session) || !session.user.role.includes(Role.Admin))
    return Response.json({ success: false }, { status: HTTPStatusCode.UNAUTHORIZED });

  let data: DeleteRequestSchema = await req.json();
  if (!deleteReuqestSchema.safeParse(data) || (!data.user && !data.url)) {
    return Response.json({ success: false, message: "Invalid request" }, { status: HTTPStatusCode.BAD_REQUEST });
  }

  let parsed_data = deleteReuqestSchema.parse(data);

  if (parsed_data.user) {
    await deleteUser(parsed_data.user, session);
  }

  if (parsed_data.url) {
    await deleteShortLinkByAdmin(parsed_data.url, session);
  }
  return Response.json({ success: true });
}
