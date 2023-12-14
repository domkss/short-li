"use client";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function Dashboard() {
  const session = useSession();
  const { replace } = useRouter();
  if (session.status !== "authenticated" || !session.data || !session.data.user) replace("/login");
  if (session.data?.user) {
    return (
      <div className='flex flex-col container min-h-screen'>
        <div> Welcome: {session.data.user?.email}</div>
        <div className='flex '>
          <div>links:</div>
        </div>
      </div>
    );
  } else {
    return <div>Unathorized</div>;
  }
}
