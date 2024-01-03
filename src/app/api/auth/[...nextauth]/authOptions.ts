import "server-only";
import { loginUserSchema } from "@/lib/client/dataValidations";
import { loginUser } from "@/lib/server/authentication";
import Credentials from "next-auth/providers/credentials";
import { AuthOptions } from "next-auth";
import { LoginUserResult } from "@/lib/server/serverConstants";

const authOptions: AuthOptions = {
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { type: "text" },
        password: { type: "password" },
      },
      async authorize(credentials) {
        const { email, password } = loginUserSchema.parse(credentials);
        let success: LoginUserResult = LoginUserResult.Failed;
        try {
          success = await loginUser(email, password);
        } catch (e) {
          throw new Error("The auth server is not available.\nPlease try again later.");
        }
        if (success === LoginUserResult.Success) {
          return { id: email, email: email };
        } else if (success === LoginUserResult.Blocked) {
          throw new Error("Too many failed attempt.\nPlease try again later.");
        } else if (success === LoginUserResult.Restricted) {
          throw new Error("User account is restricted.");
        } else {
          throw new Error("Invalid username or password.\nPlease try again.");
        }
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXT_AUTH_SECRET,

  pages: {
    signIn: "/login",
  },
};

export default authOptions;
