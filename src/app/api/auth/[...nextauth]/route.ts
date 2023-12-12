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
            console.log("succesfull login");
            return { email: email, id: email };
          } else {
            console.log("Invalid password");
            return null;
          }
        } catch (e) {
          //Todo handle error
          console.log(e);
          return null;
        }
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXT_AUTH_SECRET,

  callbacks: {
    async session({ session, token }) {
      session.user.email = token.email;
      return session;
    },
    async jwt({ token, account, user }) {
      if (account) {
        token.accessToken = account.access_token;
        token.email = user.email;
      }
      console.log(token);
      return token;
    },
  },

  pages: {
    signIn: "/login",
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
