import "server-only";
import { NextRequest } from "next/server";
import { passwordRecoverySchema } from "@/lib/helperFunctions";

import { AUTHENTICATION_ERRORS } from "@/lib/server/serverConstants";
import { StatusCodes as HTTPStatusCode } from "http-status-codes";

export async function POST(req: NextRequest) {
  const content = await req.json();
  const parsedContent = passwordRecoverySchema.safeParse(content);

  if (!parsedContent.success)
    return Response.json(
      { success: false, error: "Invalid email or reCaptchaToken" },
      { status: HTTPStatusCode.BAD_REQUEST },
    );

  try {
    //Todo send email
    return Response.json({ success: true, user: { email: parsedContent.data.email } }, { status: HTTPStatusCode.OK });
  } catch (e) {
    if (e instanceof Error && e.message === AUTHENTICATION_ERRORS.RECAPCHA_VALIDATION_FAILED) {
      return Response.json(
        { success: false, error: "ReCaptcha validation failed.\nPleas try again later." },
        { status: HTTPStatusCode.OK },
      );
    }

    return Response.json(
      { success: false, error: "Internal server error" },
      { status: HTTPStatusCode.INTERNAL_SERVER_ERROR },
    );
  }
}
