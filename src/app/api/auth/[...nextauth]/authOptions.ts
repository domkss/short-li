import { loginUserSchema } from "@/lib/helperFunctions";
import { loginUser } from "@/lib/server/user/authenticate";
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
        let succes = false;
        try {
          succes = await loginUser(email, password);
        } catch (e) {
          throw new Error("The auth server is not available.\nPlease try again later.");
        }
        if (succes) {
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