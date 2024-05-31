import NextAuth, { DefaultSession, DefaultUser } from "next-auth";
import { Role } from "@/lib/common/Types";

// Extend the DefaultUser interface to include the role property
declare module "next-auth" {
  interface Session {
    user: {
      role: Role[]; // or change to `role: string;` if role is always defined
    } & DefaultSession["user"];
  }
}

// Extend the JWT interface to include the role property
declare module "next-auth/jwt" {
  interface JWT {
    role: Role[];
  }
}
