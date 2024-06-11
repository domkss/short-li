import "server-only";
import { loginUserSchema, emailSchema } from "@/lib/client/dataValidations";
import { checkLoginProvider, getUserRoles, loginUser, restrictedOrDeleted } from "@/lib/server/authentication";
import Credentials from "next-auth/providers/credentials";
import { AuthOptions } from "next-auth";
import { AUTH_PROVIDERS, LoginUserResult } from "@/lib/server/serverConstants";
import GoogleProvider from "next-auth/providers/google";
import { Role } from "@/lib/common/Types";
import { AdapterUser } from "next-auth/adapters";
import { th } from "date-fns/locale";

const authOptions: AuthOptions = {
  providers: [
    Credentials({
      id: AUTH_PROVIDERS.CREDENTIALS,
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
        } else {
          throw new Error("Invalid username or password.\nPlease try again.");
        }
      },
    }),
    GoogleProvider({
      id: AUTH_PROVIDERS.GOOGLE,
      clientId: process.env.OAUTH_GOOGLE_CLIENT_ID!,
      clientSecret: process.env.OAUTH_GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    signIn: async ({ user, account, profile }) => {
      if (!account?.provider) return false;

      if (!user.email || !emailSchema.safeParse(user.email).success) {
        /* if (account.provider === AUTH_PROVIDERS.FACEBOOK) {
          user.email = user.id + "@facebook.user";
        } else */
        throw new Error("Unable to access email address.");
      }

      let resutl = await checkLoginProvider(user.email, account.provider);

      if (resutl === LoginUserResult.Success) return true;
      else if (resutl === LoginUserResult.Restricted) throw new Error("User account restricted.");
      else throw new Error("Another authentication option is associated with this account.");
    },
    jwt: async ({ token, user }) => {
      let adapterUser = user as AdapterUser;
      if (adapterUser && adapterUser.email) token.role = getUserRoles(adapterUser);
      return token;
    },
    session: async ({ session, token }) => {
      //Add the user role to the session
      session.user.role = token.role;

      //Check if the user is restricted or deleted
      let email = session.user.email || token.email;
      if (!email || (await restrictedOrDeleted(email)) !== LoginUserResult.Success) {
        session.user.email = null;
        session.user.role = [];
      }

      return session;
    },
  },

  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXT_AUTH_SECRET,

  pages: {
    signIn: "/login",
    error: "/login",
  },
};

export default authOptions;
