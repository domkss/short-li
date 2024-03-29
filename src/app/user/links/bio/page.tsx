"use client";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import React from "react";
import SocialMediaRefBar from "@/components/atomic/SocialMediaRefBar";
import OrderableListLayout, { KeyedReactElement } from "@/components/atomic/OrderableListLayout";
import { useState, useEffect, useCallback } from "react";
import { debounce } from "@/lib/client/uiHelperFunctions";
import { COLOR_PICKER_SUGGESTED_COLORS } from "@/lib/client/clientConstants";

interface BtnListItem {
  id: number;
  text: string;
  bgColor: string;
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
  const [addButtonSelectedColor, setAddButtonSelectedColor] = useState("#90cdf4");
  const [addButtonTextInputFocused, setAddButtonTextInputFocused] = useState(false);
  const [addButtonSelectedColorInputFocused, setAddButtonSelectedColorInputFocused] = useState(false);

  const [btnList, setBtnList] = useState<BtnListItem[]>([
    {
      id: 1,
      text: "Twitter",
      bgColor: "#90cdf4",
    },
    {
      id: 2,
      text: "Facebook",
      bgColor: "#c3dafe",
    },
    {
      id: 3,
      text: "Youtube",
      bgColor: "#fc8181",
    },
  ]);

  const onDragEnd = (result: any) => {
    if (!result.destination) return;

    const reorderedItems = Array.from(btnList);
    const [reorderedItem] = reorderedItems.splice(result.source.index, 1);
    reorderedItems.splice(result.destination.index, 0, reorderedItem);

    setBtnList(reorderedItems);
  };

  const onAddBtn = () => {
    {
      if (addButtonText.trim().length > 0) {
        setBtnList([
          ...btnList,
          {
            id: btnList.length + 1,
            text: addButtonText,
            bgColor: addButtonSelectedColor,
          },
        ]);
        setAddButtonText("");
      }
    }
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedSave = useCallback(
    debounce(() => {
      onAddBtn();
    }, 1000),
    [addButtonText, addButtonSelectedColor],
  );

  useEffect(() => {
    if (addButtonSelectedColorInputFocused === true || addButtonTextInputFocused === true) {
      debouncedSave.cancel();
    }

    if (addButtonSelectedColorInputFocused === false && addButtonTextInputFocused === false) {
      debouncedSave();
    }

    return () => debouncedSave.cancel();
  }, [addButtonTextInputFocused, addButtonSelectedColorInputFocused, debouncedSave]);

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
                      style={{ backgroundColor: item.bgColor }}
                      className="mt-2 select-none rounded-md border border-gray-300 px-5 py-3 text-center shadow-sm"
                    >
                      {item.text}
                    </div>
                  ) as KeyedReactElement,
              )}
          </OrderableListLayout>
        </div>

        <div className="flex justify-center py-2">
          <div className="relative flex basis-full justify-center rounded-md border border-gray-300 px-5 py-3 shadow-sm md:basis-2/3 xl:basis-1/3">
            <input
              placeholder="+ Add"
              className="border-gray-400 text-center placeholder-black focus:border-b-2 focus:placeholder-transparent focus:outline-none"
              value={addButtonText}
              onFocus={() => setAddButtonTextInputFocused(true)}
              onBlur={() => setAddButtonTextInputFocused(false)}
              onChange={(e) => setAddButtonText(e.currentTarget.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") onAddBtn();
              }}
            />

            <input
              type="color"
              list="presetColors"
              className="absolute right-3 top-2 h-8 w-[4.5rem] cursor-pointer rounded-lg border border-gray-200 bg-white p-1 disabled:pointer-events-none disabled:opacity-50 dark:border-gray-700 dark:bg-slate-900"
              id="hs-color-input"
              value={addButtonSelectedColor}
              onChange={(e) => {
                setAddButtonSelectedColor(e.currentTarget.value.trim());
                setAddButtonSelectedColorInputFocused(false);
              }}
              onFocus={() => setAddButtonSelectedColorInputFocused(true)}
              onBlur={() => setAddButtonSelectedColorInputFocused(false)}
              title="Choose your color"
            />

            <datalist id="presetColors">
              {COLOR_PICKER_SUGGESTED_COLORS.map((item, key) => (
                <option key={key}>{item}</option>
              ))}
            </datalist>
          </div>
        </div>

        <div className="mt-12 flex justify-center">
          <SocialMediaRefBar />
        </div>
      </div>
    </main>
  );
}
