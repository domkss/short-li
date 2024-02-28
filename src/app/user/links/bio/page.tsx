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
        <div className="my-2 flex justify-center">
          <div className="min-w-xl mb-6 p-4 md:basis-2/3 lg:basis-1/3">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vestibulum aliquam felis a nisi luctus, eget
            convallis urna volutpat. Sed ullamcorper elit id enim lacinia, at feugiat lorem efficitur.
          </div>
        </div>
        <div className="my-2 flex justify-center">
          <button className="rounded-md bg-cyan-200 px-5 py-3 ">Twitter</button>
        </div>
      </div>
    </main>
  );
}
