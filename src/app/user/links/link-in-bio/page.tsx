"use client";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import React from "react";
import OrderableListLayout, { KeyedReactElement } from "@/components/atomic/OrderableListLayout";
import { useState, useEffect, useCallback } from "react";
import { debounce } from "@/lib/client/uiHelperFunctions";
import { COLOR_PICKER_SUGGESTED_COLORS } from "@/lib/client/clientConstants";
import Image from "next/image";
import { cn } from "@/lib/client/uiHelperFunctions";
import { isValidHttpURL } from "@/lib/client/dataValidations";
import { LinkInBioButtonItem } from "@/lib/common/Types";

export default function CustomBioDashboard() {
  /*
  const reactRouter = useRouter();
  const session = useSession();
  let isServer = typeof window === "undefined" ? true : false;
  if (!isServer && (session.status !== "authenticated" || !session.data || !session.data.user))
    reactRouter.replace("/login");
*/

  const [btnList, setBtnList] = useState<LinkInBioButtonItem[]>([]);

  //#region Page Data States
  const [bio_page_url, setBio_page_url] = useState("");
  const [descriptionText, setDescriptionText] = useState("");
  //#endregion

  //#region Add Link Button states
  const [newLinkItemName, setNewLinkItemName] = useState("");
  const [addNewItemButtonInputText, setAddNewItemButtonInputText] = useState("");
  const [addNewItemSelectedColor, setAddNewItemSelectedColor] = useState("#90cdf4");
  const [addButtonTextInputFocused, setAddButtonTextInputFocused] = useState(false);
  const [addButtonSelectedColorInputFocused, setAddButtonSelectedColorInputFocused] = useState(false);
  //#endregion

  //#region GET/POST Data
  async function getPageData() {
    let response = await fetch("/api/link-in-bio");
    let data = await response.json();
    let page_url: string = data.page_url;
    let description: string = data.description;
    let linkInBioLinkButtons: LinkInBioButtonItem[] = data.link_buttons;

    if (data.success) {
      setBio_page_url(page_url);
      setDescriptionText(description);
      setBtnList(linkInBioLinkButtons);
    }
  }

  async function patchBioButtonList(newBtnList: LinkInBioButtonItem[]) {
    let response = await fetch("/api/link-in-bio", { method: "PATCH", body: JSON.stringify(newBtnList) });
    if (!response.ok) {
      //Todo: Display error
    }
  }

  useEffect(() => {
    getPageData();
  }, []);
  //#endregion

  //#region UI control functions
  const onDragEnd = (result: any) => {
    if (!result.destination) return;

    const reorderedItems = Array.from(btnList);
    const [reorderedItem] = reorderedItems.splice(result.source.index, 1);
    reorderedItems.splice(result.destination.index, 0, reorderedItem);
    patchBioButtonList(reorderedItems);
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
        let newBtnList = [
          ...btnList,
          {
            id: Math.max(...btnList.map((item) => item.id)) + 1,
            text: newLinkItemName,
            url: addNewItemButtonInputText,
            bgColor: addNewItemSelectedColor,
          },
        ];

        patchBioButtonList(newBtnList);
        setBtnList(newBtnList);
      } else {
        //Todo: Display error
      }

      setAddNewItemButtonInputText("");
      setNewLinkItemName("");
    }
  };
  //#endregion

  //#region UX enhance functions
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
  //#endregion

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
        <div className="my-2 flex justify-center">{bio_page_url}</div>
        <div className="my-2 flex justify-center">
          <div className="min-w-xl mb-6 text-gray-800 md:basis-2/3 xl:basis-1/3">{descriptionText}</div>
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
