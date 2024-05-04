"use client";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import React from "react";
import { useState, useEffect, useCallback, useRef } from "react";
import { debounce } from "@/lib/client/uiHelperFunctions";
import { COLOR_PICKER_SUGGESTED_COLORS } from "@/lib/client/clientConstants";
import { cn } from "@/lib/client/uiHelperFunctions";
import { isValidHttpURL } from "@/lib/client/dataValidations";
import { LinkInBioButtonItem, LinkInBioPatchSchema } from "@/lib/common/Types";
import LinkTreeView from "@/components/views/LinkTreeView";
import LoadingSpinner from "@/components/atomic/LoadingSpinner";

export default function CustomBioDashboard() {
  /*
  const reactRouter = useRouter();
  const session = useSession();
  let isServer = typeof window === "undefined" ? true : false;
  if (!isServer && (session.status !== "authenticated" || !session.data || !session.data.user))
    reactRouter.replace("/login");
*/
  //#region Page Data States
  const [btnList, setBtnList] = useState<LinkInBioButtonItem[]>([]);
  const [bioPageUrl, setBioPageUrl] = useState("");
  const [descriptionText, setDescriptionText] = useState("");
  const [contentLoadingFinished, setContentLoadingFinished] = useState(false);
  const [avatarImage, setAvatarImage] = useState<string>("");
  //#endregion

  //#region Add Link Button states
  const [newLinkItemName, setNewLinkItemName] = useState("");
  const [addNewItemButtonInputText, setAddNewItemButtonInputText] = useState("");
  const [addNewItemSelectedColor, setAddNewItemSelectedColor] = useState("#90cdf4");
  const [addButtonTextInputFocused, setAddButtonTextInputFocused] = useState(false);
  const [addButtonSelectedColorInputFocused, setAddButtonSelectedColorInputFocused] = useState(false);
  const addButtonInputRef = useRef<HTMLInputElement>(null);

  //#endregion

  //#region GET/POST Data
  async function getPageData() {
    let page_data_response = await fetch("/api/link-in-bio");

    if (page_data_response.ok) {
      let page_data = await page_data_response.json();
      let page_url: string = page_data.page_url;
      let page_description: string = page_data.description;
      let link_buttons: LinkInBioButtonItem[] = page_data.link_buttons;

      if (page_data.success) {
        setBioPageUrl(page_url);
        setDescriptionText(page_description);
        setBtnList(link_buttons);
      }
      getUserAvatar();
    }

    setContentLoadingFinished(true);
  }

  async function getUserAvatar() {
    let avatar_response = await fetch("/api/link-in-bio/avatar");
    if (avatar_response.ok) {
      if (avatarImage) URL.revokeObjectURL(avatarImage);
      let avatar_blob = await avatar_response.blob();

      let reader = new FileReader();
      reader.onloadend = function () {
        let base64data = reader.result as string;
        setAvatarImage(base64data);
        return;
      };
      reader.readAsDataURL(avatar_blob);
    }
  }

  async function patchBioButtonList(newBtnList: LinkInBioButtonItem[]) {
    let requestBody: LinkInBioPatchSchema = {
      newButtonList: newBtnList,
    };

    let response = await fetch("/api/link-in-bio", {
      method: "PATCH",
      body: JSON.stringify(requestBody),
    });
    if (!response.ok) {
      //Todo: Display error
    }
  }

  async function postProfilePicture(file: File) {
    const formData = new FormData();
    formData.append("file", file);

    let response = await fetch("/api/link-in-bio/avatar", {
      method: "POST",
      body: formData,
    });

    if (response.ok) {
      getUserAvatar();
    } else {
      //Todo: Display error
    }
  }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const patchBioDescription = useCallback(
    debounce(async (newDescription: string) => {
      let requestBody: LinkInBioPatchSchema = {
        newDescription: newDescription.trim(),
      };
      let response = await fetch("/api/link-in-bio", {
        method: "PATCH",
        body: JSON.stringify(requestBody),
      });
      if (!response.ok) {
        //Todo: Display error
      }
    }, 700),
    [],
  );

  useEffect(() => {
    getPageData();

    return () => {
      if (avatarImage) {
        URL.revokeObjectURL(avatarImage);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
        addButtonInputRef.current?.focus();
        return;
      }

      if (isValidHttpURL(addNewItemButtonInputText)) {
        let newBtnList = [
          ...btnList,
          {
            id: btnList.length > 0 ? Math.max(...btnList.map((item) => item.id)) + 1 : 1,
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
  const debouncedNewButtonSave = useCallback(debounce(addNewLinkItem, 1000), [
    addNewItemButtonInputText,
    addNewItemSelectedColor,
  ]);
  useEffect(() => {
    if (addButtonSelectedColorInputFocused === true || addButtonTextInputFocused === true) {
      debouncedNewButtonSave.cancel();
    }

    if (addButtonSelectedColorInputFocused === false && addButtonTextInputFocused === false) {
      debouncedNewButtonSave();
    }

    return () => debouncedNewButtonSave.cancel();
  }, [addButtonTextInputFocused, addButtonSelectedColorInputFocused, debouncedNewButtonSave]);
  //#endregion

  //Return Loading Spinner
  if (!contentLoadingFinished)
    return (
      <div className="my-auto">
        <LoadingSpinner />
      </div>
    );

  return (
    <main className="flex min-w-full flex-col">
      <div className="flex flex-col p-4">
        <LinkTreeView
          btnList={btnList}
          setBtnList={setBtnList}
          patchBioButtonList={patchBioButtonList}
          descriptionText={descriptionText}
          setDescriptionText={setDescriptionText}
          patchBioDescription={patchBioDescription}
          avatarImage={avatarImage}
          patchProfilePicture={postProfilePicture}
          onDragEnd={onDragEnd}
          bioPageUrl={bioPageUrl}
        />

        <div className="flex justify-center py-2">
          <div className="relative flex basis-full flex-row rounded-md border border-gray-300 px-2 py-2 shadow-sm md:basis-2/3 xl:basis-1/3">
            <div className="mx-3 flex basis-full flex-col">
              <div className={cn("ml-2 flex flex-1 justify-start text-sm", { hidden: newLinkItemName.length < 1 })}>
                {newLinkItemName}
              </div>
              <div className="flex flex-1 justify-start">
                <input
                  ref={addButtonInputRef}
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
