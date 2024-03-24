"use client";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import React from "react";
import SocialMediaRefBar from "@/components/atomic/SocialMediaRefBar";
import OrderableListLayout, { KeyedReactElement } from "@/components/atomic/OrderableListLayout";
import { useState } from "react";
import { cn } from "@/lib/client/uiHelperFunctions";

interface BtnListItem {
  id: number;
  text: string;
  bg_color: string;
}

export default function CustomBioDashboard() {
  /*
  const reactRouter = useRouter();
  const session = useSession();
  let isServer = typeof window === "undefined" ? true : false;
  if (!isServer && (session.status !== "authenticated" || !session.data || !session.data.user))
    reactRouter.replace("/login");
*/

  const [addButtonText, setAddButtonText] = useState("");

  const [btnList, setBtnList] = useState<BtnListItem[]>([
    {
      id: 1,
      text: "Twitter",
      bg_color: "bg-cyan-300",
    },
    {
      id: 2,
      text: "Facebook",
      bg_color: "bg-blue-300",
    },
    {
      id: 3,
      text: "Youtube",
      bg_color: "bg-red-300",
    },
  ]);

  const onDragEnd = (result: any) => {
    if (!result.destination) return;

    const reorderedItems = Array.from(btnList);
    const [reorderedItem] = reorderedItems.splice(result.source.index, 1);
    reorderedItems.splice(result.destination.index, 0, reorderedItem);

    setBtnList(reorderedItems);
  };

  const onAddBtn = (e: React.FocusEvent<HTMLInputElement, Element>) => {
    {
      if (e.target.value.trim().length > 0) {
        setBtnList([
          ...btnList,
          {
            id: btnList.length + 1,
            text: e.target.value,
            bg_color: "bg-cyan-300",
          },
        ]);
        setAddButtonText("");
      }
    }
  };

  return (
    <main className="flex min-w-full flex-col">
      <div className="flex flex-col p-4">
        <div className="flex justify-center p-4">Picture</div>
        <div className="my-2 flex justify-center">
          <div className="min-w-xl mb-6 text-gray-800 md:basis-2/3 xl:basis-1/3">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vestibulum aliquam felis a nisi luctus, eget
            convallis urna volutpat. Sed ullamcorper elit id enim lacinia, at feugiat lorem efficitur.
          </div>
        </div>
        <div className="flex justify-center">
          <OrderableListLayout className="flex basis-full flex-col md:basis-2/3 xl:basis-1/3" onDragEnd={onDragEnd}>
            {btnList &&
              btnList.map(
                (item, key) =>
                  (
                    <div
                      key={key}
                      id={item.id.toString()}
                      className={cn(
                        "mt-2 select-none rounded-md border border-gray-300 px-5 py-3 text-center shadow-sm",
                        item.bg_color,
                      )}
                    >
                      {item.text}
                    </div>
                  ) as KeyedReactElement,
              )}
          </OrderableListLayout>
        </div>

        <div className="flex justify-center py-2">
          <div className="basis-full rounded-md border border-gray-300 px-5 py-3 text-center shadow-sm md:basis-2/3 xl:basis-1/3">
            <input
              placeholder="+ Add"
              className="border-gray-400 text-center placeholder-black focus:border-b-2 focus:placeholder-transparent focus:outline-none"
              value={addButtonText}
              onChange={(e) => setAddButtonText(e.target.value)}
              onBlur={(e) => onAddBtn(e)}
            />
          </div>
        </div>

        <div className="mt-12 flex justify-center">
          <SocialMediaRefBar />
        </div>
      </div>
    </main>
  );
}
