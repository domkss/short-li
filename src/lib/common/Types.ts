import { DefaultSession } from "next-auth";

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
  session: DefaultSession | null;
  linkCustomName?: string;
};
