import { Session } from "next-auth";
import { z } from "zod";
import { emailSchema } from "../client/dataValidations";

export type LinkListItemType = {
  name: string;
  target_url: string;
  shortURL: string;
  redirect_count: string;
  click_by_country: { score: number; value: string }[];
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
  };
}
