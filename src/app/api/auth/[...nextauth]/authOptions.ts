import "server-only";
import { loginUserSchema } from "@/lib/client/dataValidations";
import { loginUser } from "@/lib/server/authentication";
import Credentials from "next-auth/providers/credentials";
import { AuthOptions } from "next-auth";

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
        let success = false;
        try {
          success = await loginUser(email, password);
        } catch (e) {
          throw new Error("The auth server is not available.\nPlease try again later.");
        }
        if (success) {
          return { id: email, email: email };
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
