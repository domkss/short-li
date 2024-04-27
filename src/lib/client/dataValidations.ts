import { Session } from "next-auth";
import { z } from "zod";
import { SessionWithEmail } from "../common/Types";

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
export const recoveryTokenSchema = z.string().min(6).optional();

export const loginUserSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Empty password is not allowed"),
});

export const registerUserSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  recaptcha_token: reCaptchaTokenSchema,
});

export const passwordRecoverySchema = z.object({
  email: emailSchema,
  recaptcha_token: reCaptchaTokenSchema,
  recovery_token: recoveryTokenSchema,
  new_password: passwordSchema.optional(),
});

export const urlSchema = z.object({
  url: z.string().min(1),
});

export const shortURLSchema = z.object({
  url: z
    .string()
    .min(1)
    .transform((string) => string.split("/").pop()),
  new_custom_name: z.string().min(1).optional(),
});

export const linkInBioButtonItemsSchema = z
  .object({
    id: z.number(),
    text: z.string(),
    url: z.string().url(),
    bgColor: z.string().regex(/^#(?:[0-9a-fA-F]{3}){1,2}$/),
  })
  .array();

export function isSessionWithEmail(session: Session | null): session is SessionWithEmail {
  if (!session || !session.user || !session.user.email) return false;

  return emailSchema.safeParse(session.user.email).success;
}
