"use client";

import { PATHS_WITH_HIDDEN_NAVBAR, NAV_BAR_LINKS } from "@/lib/client/clientConstants";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { signOut, useSession } from "next-auth/react";
import { cn } from "@/lib/client/uiHelperFunctions";

function NavBar() {
  const pathname = usePathname();
  const [mobileMenuOpened, setMobileMenuOpened] = useState(false);
  const { replace } = useRouter();
  const session = useSession();

  //Hide navbar on specified paths
  if (PATHS_WITH_HIDDEN_NAVBAR.some((path) => pathname.startsWith(path))) return null;

  return (
    <nav className="select-none bg-gray-800">
      <div className="mx-auto max-w-7xl px-2 sm:px-6 lg:px-8">
        <div className="relative flex h-16 items-center justify-between">
          <div className="absolute inset-y-0 left-0 flex items-center sm:hidden">
            {/* Mobile menu button*/}
            <button
              type="button"
              className="relative inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-gray-700 hover:text-white focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
              aria-controls="mobile-menu"
              aria-expanded="false"
              onClick={() => {
                setMobileMenuOpened(!mobileMenuOpened);
              }}
            >
              <span className="absolute -inset-0.5"></span>
              <span className="sr-only">Open main menu</span>
              {/* Icon when menu is closed.
               Menu open: "hidden", Menu closed: "block" */}
              <svg
                className={cn("h-6 w-6", mobileMenuOpened ? "hidden" : "block")}
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
              </svg>
              {/* Icon when menu is open.
              Menu open: "block", Menu closed: "hidden" */}
              <svg
                className={cn("hh-6 w-6", mobileMenuOpened ? "block" : "hidden")}
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="flex flex-1 items-center justify-center sm:items-stretch sm:justify-start">
            <div className="flex flex-shrink-0 items-center">
              <Link href="/">
                <Image
                  className="h-8 w-auto cursor-pointer"
                  src="/icons/favicon.svg"
                  alt="ShortLi logo"
                  width={84}
                  height={32}
                />
              </Link>
            </div>
            <div className="hidden sm:ml-6 sm:block">
              <div className="flex space-x-4">
                {/* Current: "bg-gray-900 text-white", Default: "text-gray-300 hover:bg-gray-700 hover:text-white" */}
                {NAV_BAR_LINKS.map((item) => {
                  if (item.requiredRole && !session.data?.user.role?.includes(item.requiredRole)) return null;

                  return (
                    <Link
                      key={item.title}
                      href={item.path}
                      className={cn(
                        pathname === item.path
                          ? "rounded-md bg-gray-900 px-3 py-2 text-sm font-medium text-white"
                          : "rounded-md px-3 py-2 text-sm font-medium text-gray-300 hover:bg-gray-700 hover:text-white",
                      )}
                      aria-current="page"
                    >
                      {item.title}
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
          <div className="absolute inset-y-0 right-0 flex items-center pr-2 sm:static sm:inset-auto sm:ml-6 sm:pr-0">
            {session.status !== "authenticated" ? (
              <Link
                href="/login"
                className={
                  pathname === "/login"
                    ? "rounded-md bg-gray-900 px-3 py-2 text-sm font-medium text-white"
                    : "rounded-md px-3 py-2 text-sm font-medium text-gray-300 hover:bg-gray-700 hover:text-white"
                }
                aria-current="page"
              >
                Login
              </Link>
            ) : (
              <button
                className="cursor-pointer rounded-md px-3 py-2 text-sm font-medium text-gray-300 hover:bg-gray-700 hover:text-white"
                onClick={() => {
                  signOut({ redirect: false }).then(() => replace("/"));
                }}
              >
                Logout
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Mobile menu, show/hide based on menu state. */}
      <div className={cn("sm:hidden", { hidden: !mobileMenuOpened })} id="mobile-menu">
        <div className="space-y-1 px-2 pb-3 pt-2">
          {NAV_BAR_LINKS.map((item) => {
            if (item.requiredRole && !session.data?.user.role?.includes(item.requiredRole)) return null;

            return (
              <Link
                key={item.title}
                href={item.path}
                className={cn(
                  pathname === item.path
                    ? "block rounded-md bg-gray-900 px-3 py-2 text-base font-medium text-white"
                    : "block rounded-md px-3 py-2 text-base font-medium text-gray-300 hover:bg-gray-700 hover:text-white",
                )}
                onClick={() => {
                  setMobileMenuOpened(!mobileMenuOpened);
                }}
                aria-current="page"
              >
                {item.title}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}

export default NavBar;
