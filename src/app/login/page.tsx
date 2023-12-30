"use client";

import Image from "next/image";
import { useState } from "react";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  registerUserSchema,
  loginUserSchema,
  emailSchema,
  passwordRecoverySchema,
  recoveryTokenSchema,
} from "@/lib/client/dataValidations";
import { cn } from "@/lib/client/uiHelperFunctions";
import { useGoogleReCaptcha } from "react-google-recaptcha-v3";
import { RECAPTCHA_ACTIONS } from "@/lib/server/serverConstants";

enum ViewType {
  LoginView,
  RegisterView,
  PasswordRecoveryView,
  SetNewPasswordView,
}

export default function LoginPage() {
  const [viewType, setViewType] = useState(ViewType.LoginView);
  const [email, setEmail] = useState("");
  const [passwRecoveryToken, setPasswRecoveryToken] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorText, setErrorText] = useState("");

  const reactRouter = useRouter();
  const session = useSession();
  /*Redirect if the user already logged in */
  if (session.status === "authenticated") reactRouter.replace("/user/links");

  const { executeRecaptcha } = useGoogleReCaptcha();

  /*Register and login form submit handler */
  async function handleSubmit(e: React.FormEvent, currentViewType: ViewType) {
    e.preventDefault();

    if (currentViewType === ViewType.RegisterView) {
      if (!registerUserSchema.safeParse({ email: email, password: password }).success) return;

      setLoading(true);

      /*Request reCapcha token */

      if (!executeRecaptcha) {
        setErrorText("Faild to execute reCaptcha. Reload the site and try again.");
        setLoading(false);
        return;
      }

      let reCaptchaToken = await executeRecaptcha(RECAPTCHA_ACTIONS.REGISTER_FORM_SUBMIT);
      if (!reCaptchaToken) {
        setErrorText("Faild to execute reCaptcha. Reload the site and try again.");
        setLoading(false);
        return;
      }

      let result = await fetch("/api/auth/register", {
        method: "POST",
        body: JSON.stringify({
          email: email,
          password: password,
          reCaptchaToken: reCaptchaToken,
        }),
      });

      let data = await result.json();

      if (!data.success || !data.user) {
        setErrorText(data.error);
        setLoading(false);
      } else {
        setLoading(false);
        handleSubmit(e, ViewType.LoginView);
      }
    } else if (currentViewType === ViewType.LoginView) {
      if (!loginUserSchema.safeParse({ email: email, password: password }).success) return;
      setLoading(true);
      //Login
      let loginResult = await signIn("credentials", {
        email: email,
        password: password,
        redirect: false,
      });
      setLoading(false);

      if (!loginResult?.ok) {
        let error = loginResult?.error || "The authentication server is not available\nPlease try again later.";
        setErrorText(error);
        return;
      } else {
        reactRouter.replace("/user/links");
      }
    } else if (currentViewType === ViewType.PasswordRecoveryView) {
      if (!passwordRecoverySchema.safeParse({ email: email }).success) return;
      setLoading(true);

      /*Request reCapcha token */

      if (!executeRecaptcha) {
        setErrorText("Faild to execute reCaptcha. Reload the site and try again.");
        setLoading(false);
        return;
      }

      let reCaptchaToken = await executeRecaptcha(RECAPTCHA_ACTIONS.PW_RECOVERY_TOKEN_REQUEST);
      if (!reCaptchaToken) {
        setErrorText("Faild to execute reCaptcha. Reload the site and try again.");
        setLoading(false);
        return;
      }

      let result = await fetch("/api/auth/recover", {
        method: "POST",
        body: JSON.stringify({
          email: email,
          reCaptchaToken: reCaptchaToken,
        }),
      });

      let data = await result.json();
      if (!data.success) setErrorText(data.error);
      else setViewType(ViewType.SetNewPasswordView);
      setLoading(false);
    } else if (currentViewType === ViewType.SetNewPasswordView) {
      let formData = { email: email, recoveryToken: passwRecoveryToken, newPassword: password };
      if (!passwordRecoverySchema.safeParse(formData).success) return;

      setLoading(true);

      let result = await fetch("/api/auth/recover", {
        method: "POST",
        body: JSON.stringify(formData),
      });

      let data = await result.json();
      if (!data.success) {
        setErrorText(data.error);
        setLoading(false);
      } else {
        setLoading(false);
        handleSubmit(e, ViewType.LoginView);
      }
    }
  }

  const submitDisabled = () => {
    if (loading) return true;
    if ([ViewType.RegisterView, ViewType.SetNewPasswordView].includes(viewType)) {
      if (password !== confirmPassword) return true;

      if (viewType === ViewType.RegisterView)
        return !registerUserSchema.safeParse({ email: email, password: password }).success;

      if (viewType === ViewType.SetNewPasswordView)
        return !passwordRecoverySchema.safeParse({
          email: email,
          newPassword: password,
          recoveryToken: passwRecoveryToken,
        }).success;
    }
    return false;
  };

  return (
    <main className="flex flex-col">
      <div className="flex-1 justify-center px-6 py-12 lg:px-8">
        {/*Page Logo and Title */}
        <div className="sm:mx-auto sm:w-full sm:max-w-sm">
          <Image
            className="mx-auto h-14 w-auto rounded-lg pl-8"
            src="/icons/shortli_logo.svg"
            alt="ShortLi logo"
            width={56}
            height={56}
          />
          <h2 className="mt-10 text-center text-2xl font-bold leading-9 tracking-tight text-gray-900">
            {viewType === ViewType.RegisterView
              ? "Create your account"
              : viewType === ViewType.LoginView
                ? "Sign in to your account"
                : "Recover your password"}
          </h2>
          <div
            className={cn(
              "mx-4 mt-2 flex flex-row justify-stretch rounded-md  border-[1px] border-red-300 bg-red-200 py-2 align-middle",
              { invisible: errorText.length === 0 },
            )}
          >
            <Image
              className="my-auto ml-2 mr-1 h-6"
              src="/icons/circle_user_error.svg"
              alt="Error icon"
              width={24}
              height={24}
            />
            <span className="whitespace-pre-line font-[500px] tracking-tight">{errorText}</span>
          </div>
        </div>

        <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-sm">
          <form className="space-y-6" onSubmit={(e) => handleSubmit(e, viewType)}>
            {/*Email Input */}
            <div
              className={cn({
                hidden: viewType === ViewType.SetNewPasswordView,
              })}
            >
              <label htmlFor="email" className="block text-sm font-medium leading-6 text-gray-900">
                Email address
              </label>
              <div className="mt-2">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required={viewType !== ViewType.SetNewPasswordView}
                  onChange={(input) => setEmail(input.target.value)}
                  className="block w-full rounded-md border-0 py-1.5 pl-1 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                />
              </div>
            </div>

            {/*Password Reset Token Input */}
            <div
              className={cn({
                hidden: viewType !== ViewType.SetNewPasswordView,
              })}
            >
              <label htmlFor="email" className="block text-sm font-medium leading-6 text-gray-900">
                Password Reset Token
              </label>
              <div className="mt-2">
                <input
                  id="resetToken"
                  name="reset token"
                  type="text"
                  required={viewType === ViewType.SetNewPasswordView}
                  onChange={(input) => setPasswRecoveryToken(input.target.value)}
                  className="block w-full rounded-md border-0 py-1.5 pl-1 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                />
              </div>
            </div>

            {/*Password Input */}
            <div
              className={cn({
                hidden: viewType === ViewType.PasswordRecoveryView,
              })}
            >
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="block text-sm font-medium leading-6 text-gray-900">
                  {viewType == ViewType.SetNewPasswordView ? "New Password" : "Password"}
                </label>
                <div className={cn("text-sm", { hidden: viewType !== ViewType.LoginView })}>
                  <button
                    type="button"
                    className="font-semibold text-indigo-600 hover:text-indigo-500"
                    onClick={() => {
                      setViewType(ViewType.PasswordRecoveryView);
                    }}
                  >
                    Forgot password?
                  </button>
                </div>
              </div>
              <div className="mt-2">
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete={viewType === ViewType.LoginView ? "current-password" : "new-password"}
                  required={viewType !== ViewType.PasswordRecoveryView}
                  onChange={(input) => setPassword(input.target.value)}
                  className="block w-full rounded-md border-0 py-1.5 pl-1 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                />
              </div>
            </div>

            {/*Password Confirmation input */}
            <div className={cn({ hidden: ![ViewType.RegisterView, ViewType.SetNewPasswordView].includes(viewType) })}>
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="block text-sm font-medium leading-6 text-gray-900">
                  Confirm Password
                </label>
              </div>
              <div className="mt-2">
                <input
                  id="password-confirm"
                  name="confirm-password"
                  type="password"
                  autoComplete="new-password"
                  required={viewType === ViewType.RegisterView}
                  onChange={(input) => {
                    setConfirmPassword(input.target.value);
                  }}
                  className="block w-full rounded-md border-0 py-1.5 pl-1 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                />
              </div>
            </div>

            {/*Form data validation view */}
            <div className={cn({ hidden: ![ViewType.RegisterView, ViewType.SetNewPasswordView].includes(viewType) })}>
              <div id="hs-strong-password-hints">
                <h4 className="mb-2 text-sm font-semibold text-gray-800 dark:text-white">Form data validation:</h4>
                <ul className="space-y-1 text-sm text-gray-500">
                  {/*Email format invalid*/}
                  <li
                    className={cn(
                      "flex items-center gap-x-2",
                      {
                        "text-green-400": emailSchema.safeParse(email).success,
                      },
                      {
                        "text-red-500": !emailSchema.safeParse(email).success && email.length > 0,
                      },
                      {
                        hidden: viewType !== ViewType.RegisterView,
                      },
                    )}
                  >
                    <span
                      className={cn({
                        hidden: !emailSchema.safeParse(email).success,
                      })}
                      data-check
                    >
                      <svg
                        className="h-4 w-4 flex-shrink-0"
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    </span>
                    <span
                      className={cn({
                        hidden: emailSchema.safeParse(email).success,
                      })}
                      data-uncheck
                    >
                      <svg
                        className="h-4 w-4 flex-shrink-0"
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M18 6 6 18" />
                        <path d="m6 6 12 12" />
                      </svg>
                    </span>
                    Valid email address is required.
                  </li>
                  {/*Password Reset Token format invalid*/}
                  <li
                    className={cn(
                      "flex items-center gap-x-2",
                      {
                        "text-green-400": recoveryTokenSchema.safeParse(passwRecoveryToken).success,
                      },
                      {
                        "text-red-500":
                          !recoveryTokenSchema.safeParse(passwRecoveryToken).success && passwRecoveryToken.length > 0,
                      },
                      {
                        hidden: viewType !== ViewType.SetNewPasswordView,
                      },
                    )}
                  >
                    <span
                      className={cn({
                        hidden: !recoveryTokenSchema.safeParse(passwRecoveryToken).success,
                      })}
                      data-check
                    >
                      <svg
                        className="h-4 w-4 flex-shrink-0"
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    </span>
                    <span
                      className={cn({
                        hidden: recoveryTokenSchema.safeParse(passwRecoveryToken).success,
                      })}
                      data-uncheck
                    >
                      <svg
                        className="h-4 w-4 flex-shrink-0"
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M18 6 6 18" />
                        <path d="m6 6 12 12" />
                      </svg>
                    </span>
                    Valid password reset token is required.
                  </li>
                  {/*Min password lenght*/}
                  <li
                    className={cn(
                      "flex items-center gap-x-2",
                      {
                        "text-green-400": password.length >= 8,
                      },
                      {
                        "text-red-500": password.length < 8 && password.length > 0,
                      },
                    )}
                  >
                    <span className={cn({ hidden: password.length < 8 })} data-check>
                      <svg
                        className="h-4 w-4 flex-shrink-0"
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    </span>
                    <span className={cn({ hidden: password.length >= 8 })} data-uncheck>
                      <svg
                        className="h-4 w-4 flex-shrink-0"
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M18 6 6 18" />
                        <path d="m6 6 12 12" />
                      </svg>
                    </span>
                    Minimum password length is 8 character.
                  </li>
                  {/*Confirmation password*/}
                  <li
                    className={cn(
                      "flex items-center gap-x-2",
                      {
                        "text-green-400": password === confirmPassword && confirmPassword.length > 0,
                      },
                      {
                        "text-red-500": password !== confirmPassword && confirmPassword.length > 0,
                      },
                    )}
                  >
                    <span
                      className={cn({
                        hidden: password !== confirmPassword || confirmPassword.length < 1,
                      })}
                      data-check
                    >
                      <svg
                        className="h-4 w-4 flex-shrink-0"
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    </span>
                    <span
                      className={cn({
                        hidden: password === confirmPassword && confirmPassword.length > 0,
                      })}
                      data-uncheck
                    >
                      <svg
                        className="h-4 w-4 flex-shrink-0"
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M18 6 6 18" />
                        <path d="m6 6 12 12" />
                      </svg>
                    </span>
                    The confirmation password must match.
                  </li>
                </ul>
              </div>
            </div>

            {/*Sumbit button */}
            <div>
              <button
                type="submit"
                disabled={submitDisabled()}
                className={cn(
                  `flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold leading-6 
                  text-white shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2`,
                  {
                    "hover:bg-indigo-500  focus-visible:outline-indigo-600": !submitDisabled(),
                  },
                  { "bg-emerald-500": [ViewType.RegisterView, ViewType.SetNewPasswordView].includes(viewType) },
                  {
                    "hover:bg-green-500 focus-visible:outline-green-500":
                      !submitDisabled() && [ViewType.RegisterView, ViewType.SetNewPasswordView].includes(viewType),
                  },
                  {
                    "bounce-and-shake hover:bg-red-400": submitDisabled() && !loading,
                  },
                )}
              >
                {viewType === ViewType.RegisterView
                  ? "Sign up"
                  : viewType === ViewType.LoginView
                    ? "Sign in"
                    : viewType === ViewType.PasswordRecoveryView
                      ? "Send Recovery Token"
                      : "Update Password"}
                <div
                  className={cn(
                    "ml-2 inline-block h-4 w-4 animate-spin self-center rounded-full border-2 border-solid border-current",
                    "text-primary border-white border-r-transparent motion-reduce:animate-[spin_1.5s_linear_infinite]",
                    { hidden: !loading },
                  )}
                  role="status"
                />
              </button>
            </div>
          </form>
          {/*Login/Register view switch */}
          <p className="mt-10 text-center text-sm text-gray-500">
            {viewType === ViewType.LoginView ? "Don't have an account yet?" : "Already have an account?"}
            <button
              className="ml-1 font-semibold leading-6 text-indigo-600 hover:text-indigo-500"
              onClick={() => {
                let newViewType = viewType === ViewType.LoginView ? ViewType.RegisterView : ViewType.LoginView;
                setViewType(newViewType);
              }}
            >
              {viewType === ViewType.LoginView ? "Get Started" : "Login now!"}
            </button>
          </p>
        </div>
      </div>
    </main>
  );
}
