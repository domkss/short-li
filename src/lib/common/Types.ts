import { Session } from "next-auth";
import { z } from "zod";
import {
  emailSchema,
  linkInBioPatchSchema,
  registerUserSchema,
  shortURLSchema,
  longURLSchema,
  passwordRecoverySchema,
  loginUserSchema,
  deleteReuqestSchema,
} from "../client/dataValidations";

export const enum Role {
  Admin = "Admin",
  User = "User",
}

export type LinkListItemType = {
  name: string;
  target_url: string;
  shortURL: string;
  redirect_count: string;
  click_by_country: { score: number; value: string }[];
  link_ttl: number;
};

export type Promisify<T> = {
  [K in keyof T]: Promise<T[K] | undefined>;
};

export interface LinkInBioButtonItem {
  id: number;
  text: string;
  url: string;
  bgColor: string;
}

//Todo: Implement advanced link creation with more options
export type CreateShortURLOptions = {
  session: SessionWithEmail | null;
  linkCustomName?: string;
};

export interface SessionWithEmail extends Session {
  user: {
    name?: string | null;
    email: z.infer<typeof emailSchema>;
    image?: string | null;
    role: Role[];
  };
}

export type LongURLSchema = z.infer<typeof longURLSchema>;

export type ShortURLSchema = z.infer<typeof shortURLSchema>;

export type LoginUserSchema = z.infer<typeof loginUserSchema>;

export type RegisterUserSchema = z.infer<typeof registerUserSchema>;

export type PasswordRecoverySchema = z.infer<typeof passwordRecoverySchema>;

export type LinkInBioPatchSchema = z.infer<typeof linkInBioPatchSchema>;

export type DeleteRequestSchema = z.infer<typeof deleteReuqestSchema>;
