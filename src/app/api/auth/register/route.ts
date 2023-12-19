import { NextRequest } from "next/server";
import { registerUserSchema } from "@/lib/helperFunctions";
import { registerNewUser } from "@/lib/server/authentication";

export async function POST(req: NextRequest) {
  const content = await req.json();
  const parsedContent = registerUserSchema.safeParse(content);
  if (!parsedContent.success)
    return Response.json({ success: false, error: "Invalid email and password format" }, { status: 400 });
  try {
    await registerNewUser(parsedContent.data.email, parsedContent.data.password);
    return Response.json({ success: true, user: { email: parsedContent.data.email } }, { status: 200 });
  } catch (_) {
    return Response.json(
      { success: false, error: "This email is already in use.\n Please choose another." },
      { status: 200 },
    );
  }
}
