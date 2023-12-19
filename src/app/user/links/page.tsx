"use client";
import SessionMap from "@/components/session-world-map/SessionMap";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { DummyURLs } from "./_devConsts";
import { useState } from "react";
import clsx from "clsx";
import { list } from "postcss";

export default function Dashboard() {
  const itemsPerPage = 10;
  const [listFirstItemIndex, setListFirstItemIndex] = useState(0);
  const [listItems, setListItems] = useState(DummyURLs);

  //const session = useSession();
  //const { replace } = useRouter();
  //if (session.status !== "authenticated" || !session.data || !session.data.user) replace("/login");
  //if (session.data?.user) {
  return (
    <div className='flex flex-row max-sm:flex-col'>
      <div className='basis-1/3 min-w-0'>
        {/*Link list header */}
        <div className='flex flex-row border-b-2 border-blue-200 text-center p-3 bg-indigo-100 0 shadow-md rounded-b-lg'>
          <div className='flex basis-1/3 items-center justify-center'>
            <Image className='' src='/links_undraw.svg' width={38} height={38} alt='My Links icon' />
          </div>
          <div className='flex bais-2/3'>
            <span className='text-xl font-semibold'>My Links</span>
          </div>
        </div>
        {/*Link list */}
        <ul className='mt-1'>
          {listItems.map((item, key) => {
            const listItem = (key: number, invisible: boolean) => (
              <li
                className={
                  invisible
                    ? "invisible"
                    : listFirstItemIndex <= key && listFirstItemIndex + itemsPerPage > key
                    ? ""
                    : "hidden"
                }
                key={key}
              >
                <div className='border-b-[1px] border-slate-200 cursor-pointer hover:bg-slate-100 shadow-sm'>
                  <div className='flex flex-row flex-nowrap items-center'>
                    <span className='ml-4'>{key + 1 + "."}</span>
                    <div className='flex flex-col overflow-ellipsis overflow-hidden whitespace-nowrap'>
                      <span className='px-2 font-semibold'>{item.name}</span>
                      <span className='px-2'>{item.shortURL}</span>
                    </div>
                  </div>
                </div>
              </li>
            );

            /*If we are on the last page create invisible copies of the last item 
               util it filles the desired number of display items,
               to keep the pagination bar in place withotu abosolute positioning*/
            if (
              key === listItems.length - 1 &&
              listItems.length % itemsPerPage !== 0 &&
              listFirstItemIndex + itemsPerPage > listItems.length
            ) {
              return [...Array(itemsPerPage - (listItems.length % itemsPerPage) + 1).keys()].map((k) =>
                listItem(key + k, k !== 0)
              );
            } else return listItem(key, false);
          })}
        </ul>
        {/*Link pagination bar */}
        <div className='flex flex-row justify-center mb-8'>
          <ul className='flex flex-row flex-wrap items-center'>
            {[...Array(Math.ceil(listItems.length / itemsPerPage)).keys()].map((item, key) => (
              <li
                key={key}
                className='p-3 max-sm:p-5 border-t-[3px] border-transparent hover:border-slate-300 active:border-blue-400'
                onClick={() => setListFirstItemIndex(key * itemsPerPage)}
              >
                {item + 1}
              </li>
            ))}
          </ul>
        </div>
      </div>
      {/*Detailed view of the selected link */}
      <div className='flex flex-col basis-2/3'>
        <div className='p-2'>
          <div className='flex flex-row p-3 justify-center'>
            <span className='mx-2 font-semibold text-2xl text-gray-900 font-serif'>Google Calendar Link</span>
            <Image
              className='mx-2 cursor-pointer'
              src='/edit_pencil.svg'
              width={20}
              height={20}
              alt='Edit pencil icon'
            />
          </div>
          <div className='flex flex-col p-4'>
            <div className='flex flex-col my-2'>
              <span className='text-lg font-semibold text-gray-700'>Short link:</span>
              <div className='flex flex-row items-center'>
                <span className='block'>shortli.click/abc2132</span>
              </div>
            </div>
            <div className='flex flex-col my-2'>
              <div className='flex flex-row items-center'>
                <span className='text-lg font-semibold text-gray-700 min-w-fit'>Original URL:</span>
              </div>
              <textarea
                className='flex-1 rounded-md p-2 bg-transparent'
                rows={4}
                readOnly={true}
                value={listItems.at(-2)?.url}
              />
            </div>
          </div>
        </div>
        <div className='flex p-2'>Total clicks</div>
      </div>
    </div>
  );
  // } else {
  //  return <div>Unathorized</div>;
  //}
}
