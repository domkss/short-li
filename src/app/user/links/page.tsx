"use client";
import SessionMap from "@/components/session-world-map/SessionMap";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { DummyURLs } from "./_devConsts";

export default function Dashboard() {
  //const session = useSession();
  //const { replace } = useRouter();
  //if (session.status !== "authenticated" || !session.data || !session.data.user) replace("/login");
  //if (session.data?.user) {
  return (
    <div className='flex flex-row max-sm:flex-col'>
      <div className='basis-1/3 mt-2'>
        <ul>
          {DummyURLs.map((item, key) => (
            <li key={key}>
              <div className='border-b-[1px] border-slate-200 cursor-pointer hover:bg-slate-100'>
                <div className='flex flex-row  flex-wrap items-center'>
                  <span className='ml-4'>{key + "."}</span>
                  <div className='flex flex-col p-3'>
                    <span className='mx-2 font-semibold'>{item.name}</span>
                    <span className='mx-2'>{item.url}</span>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
      <div className='flex flex-col basis-2/3 p-2 '>
        <div className='flex flex-row p-3 '>
          Name{" "}
          <Image className='mx-2 cursor-pointer' src='/edit_pencil.svg' width={20} height={20} alt='Edit pencil icon' />
        </div>

        <div>short link</div>
        <div>LongLink</div>
      </div>
    </div>
  );
  // } else {
  //  return <div>Unathorized</div>;
  //}
}
