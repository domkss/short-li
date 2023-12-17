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
    <div className='flex flex-row max-sm:flex-col'>
      {/*<SessionMap />*/}
      <div className='flex-1 mt-2'>
        <ul>
          {DummyURLs.map((item, key) => (
            <li key={key}>
              <div className='border-b-[1px] border-slate-200 cursor-pointer hover:bg-slate-100'>
                <div className='flex flex-row  flex-wrap items-center'>
                  <span className='ml-4'>{key + "."}</span>
                  <div className='flex flex-col p-3'>
                    <span className='mx-2'>{item.name}</span>
                    <span className='mx-2'>{item.url}</span>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
      <div className='flex-1 p-2'>
        <SessionMap />
      </div>
    </div>
  );
  // } else {
  //  return <div>Unathorized</div>;
  //}
}
