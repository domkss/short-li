"use client";
import SessionMap from "@/components/session-world-map/SessionMap";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function Dashboard() {
  //const session = useSession();
  //const { replace } = useRouter();
  //if (session.status !== "authenticated" || !session.data || !session.data.user) replace("/login");
  //if (session.data?.user) {
  return (
    <div className='flex container justify-center min-w-full'>
      <div className='flex flex-col min-h-[50vh] m-12 justify-center'>
        <SessionMap />
      </div>
    </div>
  );
  // } else {
  //  return <div>Unathorized</div>;
  //}
}
