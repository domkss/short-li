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
