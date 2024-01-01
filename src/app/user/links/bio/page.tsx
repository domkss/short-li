"use client";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Image from "next/image";

export default function CustomBioDashboard() {
  const reactRouter = useRouter();
  const session = useSession();
  if (session.status !== "authenticated" || !session.data || !session.data.user) reactRouter.replace("/login");

  return (
    <div className="flex min-h-screen min-w-full items-center">
      <div className="flex min-w-full flex-col items-center">
        <span className="mb-4 text-lg">Under development. Check back later.</span>
        <Image src="/icons/indevelopment_undraw.svg" width={240} height={240} alt="" />
      </div>
    </div>
  );
}
