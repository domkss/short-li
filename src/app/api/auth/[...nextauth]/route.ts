import NextAuth, { AuthOptions } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { loginUserSchema } from "@/lib/helperFunctions";
import { loginUser } from "@/lib/server/user/authenticate";

export const authOptions: AuthOptions = {
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { type: "text" },
        password: { type: "password" },
      },
      async authorize(credentials, req) {
        try {
          const { email, password } = loginUserSchema.parse(credentials);

          let succes = await loginUser(email, password);
          if (succes) {
            return { id: email, email: email };
          } else {
            //Todo: Invalid Password
            return null;
          }
        } catch (e) {
          //Todo: Handle DB errors
          return null;
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

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
