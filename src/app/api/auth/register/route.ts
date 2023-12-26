import "server-only";
import { NextRequest } from "next/server";
import { registerUserSchema } from "@/lib/helperFunctions";
import { registerNewUser } from "@/lib/server/authentication";
import { AUTHENTICATION_ERRORS } from "@/lib/server/serverConstants";
import { StatusCodes as HTTPStatusCode } from "http-status-codes";

export async function POST(req: NextRequest) {
  const content = await req.json();
  const parsedContent = registerUserSchema.safeParse(content);
  if (!parsedContent.success)
    return Response.json(
      { success: false, error: "Invalid email, password or reCaptchaToken" },
      { status: HTTPStatusCode.BAD_REQUEST },
    );
  try {
    await registerNewUser(parsedContent.data.email, parsedContent.data.password, parsedContent.data.reCaptchaTokken);
    return Response.json({ success: true, user: { email: parsedContent.data.email } }, { status: HTTPStatusCode.OK });
  } catch (e) {
    if (e instanceof Error && e.message === AUTHENTICATION_ERRORS.RECAPCHA_VALIDATION_FAILED) {
      return Response.json(
        { success: false, error: "ReCaptcha validation failed.\nPleas try again later." },
        { status: HTTPStatusCode.OK },
      );
    }

    return Response.json(
      { success: false, error: "This email is already in use.\n Please choose another." },
      { status: HTTPStatusCode.OK },
    );
  }
}
