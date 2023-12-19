"use client";
import clsx from "clsx";
import Image from "next/image";
import { useState } from "react";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { registerUserSchema, loginUserSchema, emailSchema } from "@/lib/helperFunctions";

export default function LoginPage() {
  const [registerView, setRegisterView] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorText, setErrorText] = useState("");
  const submitDisabled =
    loading ||
    (registerView &&
      (!registerUserSchema.safeParse({ email: email, password: password }).success || password !== confirmPassword));
  const { replace } = useRouter();
  /*Redirect if the user already logged in */
  if (useSession().status === "authenticated") replace("/user/links");

  /*Register and login form submit handler */
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (
      (!registerUserSchema.safeParse({ email: email, password: password }).success && registerView) ||
      (!loginUserSchema.safeParse({ email: email, password: password }).success && !registerView)
    )
      return;

    setLoading(true);

    if (registerView) {
      //let status = await createUser(email, password);
      let result = await fetch("/api/auth/register", {
        method: "POST",
        body: JSON.stringify({
          email: email,
          password: password,
        }),
      });

      let data = await result.json();

      if (!data.success || !data.user) {
        //Todo: handle error
        setErrorText(data.error);
        setLoading(false);
        return;
      }

      let loginResult = await signIn("credentials", {
        email: email,
        password: password,
        redirect: false,
      });
      setLoading(false);

      if (!loginResult?.ok) {
        let error = loginResult?.error || "";
        setErrorText(error);
        return;
      } else {
        replace("/user/links");
      }
    } else {
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
        replace("/user/links");
      }
    }
  }

  return (
    <main className='flex flex-col'>
      <div className='flex-1 justify-center px-6 py-12 lg:px-8'>
        {/*Page Logo and Title */}
        <div className='sm:mx-auto sm:w-full sm:max-w-sm'>
          <Image
            className='mx-auto h-14 pl-8 w-auto rounded-lg'
            src='/shortli_logo.svg'
            alt='ShortLi logo'
            width={56}
            height={56}
          />
          <h2 className='mt-10 text-center text-2xl font-bold leading-9 tracking-tight text-gray-900'>
            {registerView ? "Create your account" : "Sign in to your account"}
          </h2>
          <div
            className={clsx(
              "flex flex-row align-middle justify-stretch bg-red-200 rounded-md  mt-2 mx-4 py-2 border-[1px] border-red-300",
              { invisible: errorText.length === 0 }
            )}
          >
            <Image
              className='my-auto h-6 ml-2 mr-1'
              src='/circle_user_error.svg'
              alt='Error icon'
              width={24}
              height={24}
            />
            <span className='font-[500px] tracking-tight whitespace-pre-line'>{errorText}</span>
          </div>
        </div>

        <div className='mt-6 sm:mx-auto sm:w-full sm:max-w-sm'>
          <form className='space-y-6' onSubmit={handleSubmit}>
            {/*Email Input */}
            <div>
              <label htmlFor='email' className='block text-sm font-medium leading-6 text-gray-900'>
                Email address
              </label>
              <div className='mt-2'>
                <input
                  id='email'
                  name='email'
                  type='email'
                  autoComplete='email'
                  required
                  onChange={(input) => setEmail(input.target.value)}
                  className='block w-full rounded-md border-0 py-1.5 pl-1 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6'
                />
              </div>
            </div>

            {/*Password Input */}
            <div>
              <div className='flex items-center justify-between'>
                <label htmlFor='password' className='block text-sm font-medium leading-6 text-gray-900'>
                  Password
                </label>
                <div className={clsx("text-sm", { hidden: registerView })}>
                  <a href='#' className='font-semibold text-indigo-600 hover:text-indigo-500'>
                    Forgot password?
                  </a>
                </div>
              </div>
              <div className='mt-2'>
                <input
                  id='password'
                  name='password'
                  type='password'
                  autoComplete={registerView ? "new-password" : "current-password"}
                  required
                  onChange={(input) => setPassword(input.target.value)}
                  className='block w-full rounded-md border-0 py-1.5 pl-1 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6'
                />
              </div>
            </div>

            {/*Password Confirmation input */}
            <div className={clsx({ hidden: !registerView })}>
              <div className='flex items-center justify-between'>
                <label htmlFor='password' className='block text-sm font-medium leading-6 text-gray-900'>
                  Confirm Password
                </label>
              </div>
              <div className='mt-2'>
                <input
                  id='password-confirm'
                  name='confirm-password'
                  type='password'
                  autoComplete='new-password'
                  required={registerView}
                  onChange={(input) => {
                    setConfirmPassword(input.target.value);
                  }}
                  className='block w-full rounded-md border-0 py-1.5 pl-1 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6'
                />
              </div>
            </div>

            {/*Sign Up data validation view */}
            <div className={clsx({ hidden: !registerView })}>
              <div id='hs-strong-password-hints'>
                <h4 className='mb-2 text-sm font-semibold text-gray-800 dark:text-white'>Sign up data validation:</h4>
                <ul className='space-y-1 text-sm text-gray-500'>
                  {/*Email format invalid*/}
                  <li
                    className={clsx(
                      "flex items-center gap-x-2",
                      {
                        "text-green-400": emailSchema.safeParse(email).success,
                      },
                      {
                        "text-red-500": !emailSchema.safeParse(email).success && email.length > 0,
                      }
                    )}
                  >
                    <span className={clsx({ hidden: !emailSchema.safeParse(email).success })} data-check>
                      <svg
                        className='flex-shrink-0 w-4 h-4'
                        xmlns='http://www.w3.org/2000/svg'
                        width='24'
                        height='24'
                        viewBox='0 0 24 24'
                        fill='none'
                        stroke='currentColor'
                        strokeWidth='2'
                        strokeLinecap='round'
                        strokeLinejoin='round'
                      >
                        <polyline points='20 6 9 17 4 12' />
                      </svg>
                    </span>
                    <span className={clsx({ hidden: emailSchema.safeParse(email).success })} data-uncheck>
                      <svg
                        className='flex-shrink-0 w-4 h-4'
                        xmlns='http://www.w3.org/2000/svg'
                        width='24'
                        height='24'
                        viewBox='0 0 24 24'
                        fill='none'
                        stroke='currentColor'
                        strokeWidth='2'
                        strokeLinecap='round'
                        strokeLinejoin='round'
                      >
                        <path d='M18 6 6 18' />
                        <path d='m6 6 12 12' />
                      </svg>
                    </span>
                    Valid email address is required.
                  </li>
                  {/*Min password lenght*/}
                  <li
                    className={clsx(
                      "flex items-center gap-x-2",
                      {
                        "text-green-400": password.length >= 8,
                      },
                      {
                        "text-red-500": password.length < 8 && password.length > 0,
                      }
                    )}
                  >
                    <span className={clsx({ hidden: password.length < 8 })} data-check>
                      <svg
                        className='flex-shrink-0 w-4 h-4'
                        xmlns='http://www.w3.org/2000/svg'
                        width='24'
                        height='24'
                        viewBox='0 0 24 24'
                        fill='none'
                        stroke='currentColor'
                        strokeWidth='2'
                        strokeLinecap='round'
                        strokeLinejoin='round'
                      >
                        <polyline points='20 6 9 17 4 12' />
                      </svg>
                    </span>
                    <span className={clsx({ hidden: password.length >= 8 })} data-uncheck>
                      <svg
                        className='flex-shrink-0 w-4 h-4'
                        xmlns='http://www.w3.org/2000/svg'
                        width='24'
                        height='24'
                        viewBox='0 0 24 24'
                        fill='none'
                        stroke='currentColor'
                        strokeWidth='2'
                        strokeLinecap='round'
                        strokeLinejoin='round'
                      >
                        <path d='M18 6 6 18' />
                        <path d='m6 6 12 12' />
                      </svg>
                    </span>
                    Minimum password length is 8 character.
                  </li>
                  {/*Confirmation password*/}
                  <li
                    className={clsx(
                      "flex items-center gap-x-2",
                      {
                        "text-green-400": password === confirmPassword && confirmPassword.length > 0,
                      },
                      {
                        "text-red-500": password !== confirmPassword && confirmPassword.length > 0,
                      }
                    )}
                  >
                    <span
                      className={clsx({ hidden: password !== confirmPassword || confirmPassword.length < 1 })}
                      data-check
                    >
                      <svg
                        className='flex-shrink-0 w-4 h-4'
                        xmlns='http://www.w3.org/2000/svg'
                        width='24'
                        height='24'
                        viewBox='0 0 24 24'
                        fill='none'
                        stroke='currentColor'
                        strokeWidth='2'
                        strokeLinecap='round'
                        strokeLinejoin='round'
                      >
                        <polyline points='20 6 9 17 4 12' />
                      </svg>
                    </span>
                    <span
                      className={clsx({ hidden: password === confirmPassword && confirmPassword.length > 0 })}
                      data-uncheck
                    >
                      <svg
                        className='flex-shrink-0 w-4 h-4'
                        xmlns='http://www.w3.org/2000/svg'
                        width='24'
                        height='24'
                        viewBox='0 0 24 24'
                        fill='none'
                        stroke='currentColor'
                        strokeWidth='2'
                        strokeLinecap='round'
                        strokeLinejoin='round'
                      >
                        <path d='M18 6 6 18' />
                        <path d='m6 6 12 12' />
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
                type='submit'
                disabled={submitDisabled}
                className={clsx(
                  "flex w-full justify-center rounded-md text-white shadow-sm px-3 py-1.5 text-sm font-semibold leading-6 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2",
                  { "bg-indigo-600": !registerView },
                  { "hover:bg-indigo-500  focus-visible:outline-indigo-600": !registerView && !submitDisabled },
                  { "bg-emerald-500": registerView },
                  { "hover:bg-green-500 focus-visible:outline-green-500": !submitDisabled && registerView },
                  { "hover:bg-red-400 bounce-and-shake": submitDisabled && !loading }
                )}
              >
                {registerView ? "Sign up" : "Sign in"}
                <div
                  className={clsx(
                    "inline-block h-4 w-4 ml-2 self-center animate-spin rounded-full border-2 border-solid border-current",
                    "border-r-transparent text-primary motion-reduce:animate-[spin_1.5s_linear_infinite] border-white",
                    { hidden: !loading }
                  )}
                  role='status'
                />
              </button>
            </div>
          </form>
          {/*Login/Register view switch */}
          <p className='mt-10 text-center text-sm text-gray-500'>
            Don&apos;t have an account yet?
            <button
              className='ml-1 font-semibold leading-6 text-indigo-600 hover:text-indigo-500'
              onClick={() => {
                setRegisterView(!registerView);
              }}
            >
              Get Started
            </button>
          </p>
        </div>
      </div>
    </main>
  );
}
