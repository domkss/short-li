"use client";
import SessionMap from "@/components/session-world-map/SessionMap";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { DummyURLs } from "./_devConsts";
import { useState } from "react";
import { cn } from "@/lib/helperFunctions";
import { generateVisiblePaginationButtonKeys } from "@/lib/helperFunctions";

export default function Dashboard() {
  const linkItemsPerPage = 9;
  const [linkListFirstItemIndex, setListFirstItemIndex] = useState(0);
  const [linkListItems, setLinkListItems] = useState(DummyURLs.slice(0, 62));
  const numberOfLinkListPages = linkListItems.length / linkItemsPerPage;
  const linkListPageButtonKeys = [...Array.from(Array(Math.ceil(numberOfLinkListPages)).keys())];

  //const session = useSession();
  //const { replace } = useRouter();
  //if (session.status !== "authenticated" || !session.data || !session.data.user) replace("/login");
  //if (session.data?.user) {
  return (
    <div className="flex flex-row max-sm:flex-col">
      <div className="min-w-0 basis-1/3">
        {/*Link list header */}
        <div className="0 flex flex-row rounded-b-lg border-b-2 border-blue-200 bg-indigo-100 p-3 text-center shadow-md">
          <div className="flex basis-1/3 items-center justify-center">
            <Image className="" src="/links_undraw.svg" width={38} height={38} alt="My Links icon" />
          </div>
          <div className="bais-2/3 flex">
            <span className="text-xl font-semibold">My Links</span>
          </div>
        </div>
        {/*Link list */}
        <ul className="mt-1">
          {linkListItems.map((item, key) => {
            const listItem = (key: number, invisibleFillingItem: boolean) => {
              const lastPageDisplayed = linkListFirstItemIndex + linkItemsPerPage > linkListItems.length;
              return (
                <li
                  className={
                    invisibleFillingItem && lastPageDisplayed
                      ? "invisible"
                      : linkListFirstItemIndex <= key && linkListFirstItemIndex + linkItemsPerPage > key
                        ? ""
                        : "hidden"
                  }
                  key={key}
                >
                  <div className="cursor-pointer border-b-[1px] border-slate-200 shadow-sm hover:bg-slate-100">
                    <div className="flex flex-row flex-nowrap items-center">
                      <span className="ml-4">{key + 1 + "."}</span>
                      <div className="flex flex-col overflow-hidden overflow-ellipsis whitespace-nowrap">
                        <span className="px-2 font-semibold">{item.name}</span>
                        <span className="px-2">{item.shortURL}</span>
                      </div>
                    </div>
                  </div>
                </li>
              );
            };

            /*If we are on the last page create invisible copies of the last item 
               util it filles the desired number of display items,
               to keep the pagination bar in place withotu abosolute positioning*/
            const isLastItem = key === linkListItems.length - 1;
            const isLastPageIncomplete = linkListItems.length % linkItemsPerPage !== 0;
            if (isLastItem && isLastPageIncomplete) {
              const invisibleItemCount = linkItemsPerPage - (linkListItems.length % linkItemsPerPage) + 1;
              return Array(invisibleItemCount)
                .fill(null)
                .map((item, k) => listItem(key + k, k !== 0));
            } else return listItem(key, false);
          })}
        </ul>
        {/*Link pagination bar */}
        <div className="mb-8 flex flex-row justify-center">
          <ul className="flex flex-row flex-wrap items-center justify-center">
            {linkListPageButtonKeys.map((key) => (
              <li key={key}>
                <button
                  className={cn(
                    "cursor-pointer border-t-[3px] border-transparent p-3",
                    {
                      "border-blue-400 font-semibold": linkListFirstItemIndex === key * linkItemsPerPage,
                    },
                    {
                      "hover:border-slate-300": linkListFirstItemIndex !== key * linkItemsPerPage,
                    },

                    {
                      hidden:
                        numberOfLinkListPages > 9 &&
                        !generateVisiblePaginationButtonKeys(
                          linkListPageButtonKeys,
                          linkListFirstItemIndex / linkItemsPerPage,
                        ).includes(key),
                    },
                  )}
                  onClick={() => setListFirstItemIndex(key * linkItemsPerPage)}
                >
                  {(key + 1).toString().padStart(2, "0")}
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
      {/*Detailed view of the selected link */}
      <div className="flex basis-2/3 flex-col">
        <div className="p-2">
          <div className="flex flex-row justify-center p-3">
            <span className="mx-2 font-serif text-2xl font-semibold text-gray-900">Google Calendar Link</span>
            <Image
              className="mx-2 cursor-pointer"
              src="/edit_pencil.svg"
              width={20}
              height={20}
              alt="Edit pencil icon"
            />
          </div>
          <div className="flex flex-col p-4">
            <div className="my-2 flex flex-col">
              <span className="text-lg font-semibold text-gray-700">Short link:</span>
              <div className="flex flex-row items-center">
                <span className="block">shortli.click/abc2132</span>
              </div>
            </div>
            <div className="my-2 flex flex-col">
              <div className="flex flex-row items-center">
                <span className="min-w-fit text-lg font-semibold text-gray-700">Original URL:</span>
              </div>
              <textarea
                className="flex-1 rounded-md bg-transparent p-2"
                rows={4}
                readOnly={true}
                value={linkListItems.at(-2)?.url}
              />
            </div>
          </div>
        </div>
        <div className="flex p-2">Total clicks</div>
      </div>
    </div>
  );
  // } else {
  //  return <div>Unathorized</div>;
  //}
}
