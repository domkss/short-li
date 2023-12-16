"use client";
import SessionMap from "@/components/session-world-map/SessionMap";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

import { DummyURLs } from "./_devConsts";

export default function Dashboard() {
  //const session = useSession();
  //const { replace } = useRouter();
  //if (session.status !== "authenticated" || !session.data || !session.data.user) replace("/login");
  //if (session.data?.user) {
  return (
    <div className='flex justify-center min-w-full'>
      {/*<SessionMap />*/}
      <div className='bg-slate-100 rounded-lg'>
        <ul>
          {DummyURLs.map((item, key) => (
            <li key={key}>
              <div className='border-b-[1px] border-slate-200'>
                <div className='flex flex-col p-3'>
                  <span className='mx-2'>{item.name}</span>
                  <span className='mx-2'>{item.url}</span>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
  // } else {
  //  return <div>Unathorized</div>;
  //}
}
