"use client";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Image from "next/image";

export default function CustomBioDashboard() {
  const reactRouter = useRouter();
  const session = useSession();
  let isServer = typeof window === "undefined" ? true : false;
  if (!isServer && (session.status !== "authenticated" || !session.data || !session.data.user))
    reactRouter.replace("/login");

  return (
    <main className="flex min-w-full flex-col">
      <div className="flex flex-col p-4">
        <div className="flex flex-col items-center">
          <button className="rounded-xl bg-purple-500 p-4 text-white">sli.ink/bioLink</button>
        </div>
        <div className="my-2 flex justify-center">
          <div className="min-w-xl mb-6 basis-1/3">
            <label htmlFor="large-input" className="mb-2 block text-sm font-medium text-gray-900 dark:text-white">
              Description
            </label>
            <input
              type="text"
              id="large-input"
              className="block min-w-full rounded-lg border border-gray-300 bg-gray-50 p-4 text-base text-gray-900 focus:border-blue-500 
            focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
            />
          </div>
        </div>
      </div>
    </main>
  );
}
