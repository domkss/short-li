import "server-only";
import { NextRequest } from "next/server";
import { passwordRecoverySchema } from "@/lib/client/dataValidations";

import { AUTHENTICATION_ERRORS } from "@/lib/server/serverConstants";
import { StatusCodes as HTTPStatusCode } from "http-status-codes";
import { sendUserPasswordRecoveryToken, updateUserPasswordWithRecoveryToken } from "@/lib/server/authentication";

export async function POST(req: NextRequest) {
  const content = await req.json();
  const parsedContent = passwordRecoverySchema.safeParse(content);

  if (!parsedContent.success)
    return Response.json({ success: false, error: "Invalid email" }, { status: HTTPStatusCode.BAD_REQUEST });

  try {
    if (parsedContent.data.recovery_token && parsedContent.data.new_password) {
      let status = await updateUserPasswordWithRecoveryToken(
        parsedContent.data.email,
        parsedContent.data.recovery_token,
        parsedContent.data.new_password,
      );

      if (!status)
        return Response.json({ success: false, error: "Invalid password reset token" }, { status: HTTPStatusCode.OK });
    } else {
      await sendUserPasswordRecoveryToken(parsedContent.data.email, parsedContent.data.recaptcha_token);
    }
    return Response.json({ success: true }, { status: HTTPStatusCode.OK });
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
