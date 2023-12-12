import { z } from "zod";

export function isValidHttpURL(input: string) {
  try {
    new URL(input);
    return true;
  } catch (_) {
    return false;
  }
}

export function addHttpstoURL(input: string): string {
  if (!(input.startsWith("https://") || input.startsWith("http://"))) return "https://" + input;
  return input;
}

export const loginUserSchema = z.object({
  email: z
    .string()
    .regex(
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
      "Invalid email address"
    ),
  password: z.string().min(8, "Password should be minimum 8 character"),
});

export const registerUserSchema = z.object({
  email: z
    .string()
    .regex(
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
      "Invalid email address"
    ),
  password: z.string().min(8, "Password should be minimum 8 character"),
});
