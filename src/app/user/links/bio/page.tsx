"use client";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import React from "react";
import SocialMediaRefBar from "@/components/atomic/SocialMediaRefBar";
import OrderableListLayout, { KeyedReactElement } from "@/components/atomic/OrderableListLayout";
import { useState, useEffect, useCallback } from "react";
import { debounce } from "@/lib/client/uiHelperFunctions";
import { COLOR_PICKER_SUGGESTED_COLORS } from "@/lib/client/clientConstants";
import Image from "next/image";
import { cn } from "@/lib/client/uiHelperFunctions";
import { isValidHttpURL } from "@/lib/client/dataValidations";

interface BtnListItem {
  id: number;
  text: string;
  url: string;
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

  const [newLinkItemName, setNewLinkItemName] = useState("");
  const [addNewItemButtonInputText, setAddNewItemButtonInputText] = useState("");
  const [addNewItemSelectedColor, setAddNewItemSelectedColor] = useState("#90cdf4");

  const [addButtonTextInputFocused, setAddButtonTextInputFocused] = useState(false);
  const [addButtonSelectedColorInputFocused, setAddButtonSelectedColorInputFocused] = useState(false);

  const [btnList, setBtnList] = useState<BtnListItem[]>([
    {
      id: 1,
      text: "Twitter",
      url: "https://x.com",
      bgColor: "#90cdf4",
    },
    {
      id: 2,
      text: "Facebook",
      url: "https://facebook.com",
      bgColor: "#c3dafe",
    },
    {
      id: 3,
      text: "Youtube",
      url: "https://youtube.com",
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

  const addNewLinkItem = () => {
    {
      if (addNewItemButtonInputText.trim().length < 1) {
        setNewLinkItemName("");
        return;
      }

      if (newLinkItemName.trim().length < 1) {
        setNewLinkItemName(addNewItemButtonInputText);
        setAddNewItemButtonInputText("https://");
        return;
      }

      if (isValidHttpURL(addNewItemButtonInputText)) {
        setBtnList([
          ...btnList,
          {
            id: btnList.length + 1,
            text: newLinkItemName,
            url: addNewItemButtonInputText,
            bgColor: addNewItemSelectedColor,
          },
        ]);
      } else {
        //Todo: Throw error
      }

      setAddNewItemButtonInputText("");
      setNewLinkItemName("");
    }
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedSave = useCallback(
    debounce(() => {
      addNewLinkItem();
    }, 1000),
    [addNewItemButtonInputText, addNewItemSelectedColor],
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
        <div className="flex justify-center p-4">
          <Image
            className="h-20 w-20 rounded-full p-1 ring-2 ring-gray-300"
            src="/temp_profilepic.jpg"
            alt="Bordered avatar"
            width={80}
            height={80}
          />
        </div>
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
                      onClick={() => window.open(item.url, "_blank")}
                      className="mt-2 select-none rounded-md border border-gray-300 px-5 py-3 text-center shadow-sm"
                    >
                      {item.text}
                    </div>
                  ) as KeyedReactElement,
              )}
          </OrderableListLayout>
        </div>

        <div className="flex justify-center py-2">
          <div className="relative flex basis-full flex-row rounded-md border border-gray-300 px-2 py-2 shadow-sm md:basis-2/3 xl:basis-1/3">
            <div className="mx-3 flex basis-full flex-col">
              <div className={cn("ml-2 flex flex-1 justify-start text-sm", { hidden: newLinkItemName.length < 1 })}>
                {newLinkItemName}
              </div>
              <div className="flex flex-1 justify-start">
                <input
                  placeholder="+ Add"
                  className="ml-2 block w-full border-gray-400 px-2 placeholder-black focus:border-b-2 focus:placeholder-transparent focus:outline-none"
                  value={addNewItemButtonInputText}
                  onFocus={() => setAddButtonTextInputFocused(true)}
                  onBlur={() => {
                    setAddButtonTextInputFocused(false);
                  }}
                  onChange={(e) => setAddNewItemButtonInputText(e.currentTarget.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") addNewLinkItem();
                  }}
                />
              </div>
            </div>
            <div className="flex items-center justify-end">
              <input
                type="color"
                list="presetColors"
                className="h-8 w-[4.5rem] cursor-pointer rounded-lg border border-gray-200 bg-white p-1 disabled:pointer-events-none disabled:opacity-50"
                id="hs-color-input"
                value={addNewItemSelectedColor}
                onChange={(e) => {
                  setAddNewItemSelectedColor(e.currentTarget.value.trim());
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
        </div>
      </div>
    </main>
  );
}
