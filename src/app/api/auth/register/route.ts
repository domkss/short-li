import { NextRequest } from "next/server";
import { registerUserSchema } from "@/lib/helperFunctions";
import { registerNewUser } from "@/lib/server/user/authenticate";

export async function POST(req: NextRequest) {
  const content = await req.json();
  try {
    const { email, password } = registerUserSchema.parse(content);
    try {
      await registerNewUser(email, password);
      return Response.json({ user: { email: email } });
    } catch (e) {
      return Response.json({ error: e }, { status: 400 });
    }
  } catch (e) {
    return Response.json({ error: "Unable to create user" }, { status: 400 });
  }
}
