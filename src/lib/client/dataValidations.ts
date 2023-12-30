import { z } from "zod";

/*Data validation checkers */

export function isValidHttpURL(input: string) {
  try {
    new URL(input);
    return true;
  } catch (_) {
    return false;
  }
}

export const emailSchema = z
  .string()
  .regex(
    /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
    "Invalid email address",
  );
const passwordSchema = z.string().min(8, "Password should be minimum 8 character");
const reCaptchaTokenSchema = z.string().optional();

export const loginUserSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Empty password is not allowed"),
});

export const registerUserSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  reCaptchaTokken: reCaptchaTokenSchema,
});

export const passwordRecoverySchema = z.object({
  email: emailSchema,
  reCaptchaTokken: reCaptchaTokenSchema,
});

export const urlSchema = z.object({
  url: z.string().min(1),
});

export const shortURLSchema = z.object({
  url: z
    .string()
    .min(1)
    .transform((string) => string.split("/").pop()),
  newCustomName: z.string().min(1).optional(),
});
