"use client";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { ChangeEvent, useEffect, useState } from "react";
import {
  cn,
  progressUntilNextPowerOfTen,
  generateVisiblePaginationButtonKeys,
  debounce,
  nFormatter,
} from "@/lib/client/uiHelperFunctions";
import ConfirmationView from "@/components/ConfirmationView";
import QRCodeSelectorView from "@/components/QRCodeSelectorView";
import SessionMap from "@/components/session-world-map/SessionMap";
import { LinkListItemType } from "@/lib/common/Types";
import { CountryCodeType } from "@/components/session-world-map/world-svg-data";

export default function Dashboard() {
  const LINK_ITEM_PER_PAGE = 9;
  const [linkListFirstItemIndex, setLinkListFirstItemIndex] = useState(0);
  const [originalLinkList, setOriginalLinkList] = useState<LinkListItemType[]>([]);
  const [linkListItems, setLinkListItems] = useState<LinkListItemType[]>([]);
  const [deleteLinkViewActive, setDeleteLinkViewActive] = useState(false);
  const [qrCodeViewActive, setQrCodeViewActive] = useState(false);

  const numberOfLinkListPages = linkListItems.length / LINK_ITEM_PER_PAGE;
  const linkListPageButtonKeys = [...Array.from(Array(Math.ceil(numberOfLinkListPages)).keys())];
  const [activeLinkListItemIndex, setActiveLinkListItemIndex] = useState(0);
  const [nameEditingView, setNameEditingView] = useState(false);
  const [nameInputValue, setNameInputValue] = useState("");
  const [contentLoadingFinished, setContentLoadingFinished] = useState(false);

  const resetDetailView = () => {
    setNameEditingView(false);
    setNameInputValue("");
  };

  const searchListElements = debounce((event: ChangeEvent<HTMLInputElement>) => {
    if (originalLinkList.length === 0) setOriginalLinkList(linkListItems);

    let searchWord = event.target.value.toLowerCase();
    let filteredList = originalLinkList.filter(
      (item) =>
        item.name.toLowerCase().includes(searchWord) ||
        item.shortURL.toLowerCase().includes(searchWord) ||
        item.target_url.toLowerCase().includes(searchWord),
    );
    setLinkListItems(filteredList);
  }, 400);

  async function getUserLinks() {
    let response = await fetch("/api/link");
    let data = await response.json();
    let linkList: LinkListItemType[] = data.linkDataList;

    if (data.success && linkList[0].shortURL) {
      setOriginalLinkList([]);
      setLinkListItems(data.linkDataList);
    }
    setContentLoadingFinished(true);
  }

  async function deleteUserLink(shortURL: string) {
    let result = await fetch("/api/link", {
      method: "DELETE",
      body: JSON.stringify({
        url: shortURL,
      }),
    });
    let data = await result.json();
    if (data.success) {
      getUserLinks();
      if (activeLinkListItemIndex !== 0) {
        setActiveLinkListItemIndex(activeLinkListItemIndex - 1);
        if (activeLinkListItemIndex - 1 < linkListFirstItemIndex)
          setLinkListFirstItemIndex(linkListFirstItemIndex - LINK_ITEM_PER_PAGE);
      }
      setDeleteLinkViewActive(false);
    } else {
      //Todo: Show error if item deletion failed
    }
  }

  async function updateLinkItemCustomName(shortURL: string, newCustomName: string) {
    let result = await fetch("/api/link", {
      method: "PATCH",
      body: JSON.stringify({
        url: shortURL,
        newCustomName: newCustomName,
      }),
    });
    let data = await result.json();

    if (data.success) {
      /*Handle name change on list items on client side instead reload all data from server */
      let modifiedLinkListItem = linkListItems.at(activeLinkListItemIndex);
      if (modifiedLinkListItem) {
        modifiedLinkListItem.name = newCustomName;
        let modifiedOriginalLinkList = originalLinkList.filter((item) => item.shortURL !== shortURL);
        modifiedOriginalLinkList.unshift(modifiedLinkListItem);
        setOriginalLinkList(modifiedOriginalLinkList);
        let modifiedLinkList = linkListItems.filter((item) => item.shortURL !== shortURL);
        modifiedLinkList.unshift(modifiedLinkListItem);
        setLinkListItems(modifiedLinkList);
        setActiveLinkListItemIndex(0);
        setLinkListFirstItemIndex(0);
      }
    }
  }

  const reactRouter = useRouter();
  const session = useSession();
  let isServer = typeof window === "undefined" ? true : false;
  if (!isServer && (session.status !== "authenticated" || !session.data || !session.data.user))
    reactRouter.replace("/login");

  useEffect(() => {
    getUserLinks();
  }, []);

  return (
    <div>
      {contentLoadingFinished ? (
        <div className="flex flex-row max-lg:flex-col">
          {/*Link List */}
          <div className="min-w-0 basis-1/3">
            {/*Link list header */}
            <div className="flex flex-col rounded-b-lg border-b-2 border-blue-200 bg-indigo-100 p-3 text-center shadow-md">
              <div className="flex flex-row justify-between">
                <div className="flex flex-row">
                  <Image className="m-3" src="/icons/links_undraw.svg" width={38} height={38} alt="My Links icon" />
                  <span className="m-3 text-xl font-semibold">My Links</span>
                </div>
                {/*Todo: Create detailed link add page with more options, until then just redirect to the main page */}
                <button
                  className="m-3 rounded-2xl border-2 border-blue-500 bg-blue-500 p-2 text-white"
                  onClick={() => reactRouter.replace("/")}
                >
                  + Add link
                </button>
              </div>
              {/*Search bar*/}
              <div className="mt-3 flex">
                <input
                  className="min-w-[60%] rounded-md bg-gray-50 p-2 max-sm:w-full"
                  placeholder="Search"
                  onChange={(event) => {
                    searchListElements(event);
                  }}
                />
              </div>
            </div>

            {/*Link list */}
            <ul className="mt-1">
              {linkListItems.map((item, key) => {
                const listItem = (key: number, invisibleFillingItem: boolean) => {
                  const lastPageDisplayed = linkListFirstItemIndex + LINK_ITEM_PER_PAGE > linkListItems.length;
                  return (
                    <li
                      className={
                        invisibleFillingItem && lastPageDisplayed
                          ? "invisible"
                          : linkListFirstItemIndex <= key && linkListFirstItemIndex + LINK_ITEM_PER_PAGE > key
                            ? ""
                            : "hidden"
                      }
                      key={key}
                    >
                      <button
                        className={cn(
                          "flex min-w-full border-b-[1px] border-slate-100 text-left shadow-sm hover:bg-blue-200",
                          { "bg-emerald-200": key === activeLinkListItemIndex },
                        )}
                        onClick={() => {
                          resetDetailView();
                          setActiveLinkListItemIndex(key);
                        }}
                      >
                        <div className="flex flex-row flex-nowrap items-center">
                          <span className="ml-4">{key + 1 + "."}</span>
                          <div className="flex flex-col overflow-hidden overflow-ellipsis whitespace-nowrap">
                            <span className="px-2">{item.name}</span>
                            <span className="px-2">{item.shortURL}</span>
                          </div>
                        </div>
                      </button>
                    </li>
                  );
                };

                /*If we are on the last page create invisible copies of the last item 
               util it filles the desired number of display items,
               to keep the pagination bar in place withotu abosolute positioning*/
                const isLastItem = key === linkListItems.length - 1;
                const isLastPageIncomplete = linkListItems.length % LINK_ITEM_PER_PAGE !== 0;
                if (isLastItem && isLastPageIncomplete) {
                  const invisibleItemCount = LINK_ITEM_PER_PAGE - (linkListItems.length % LINK_ITEM_PER_PAGE) + 1;
                  return Array(invisibleItemCount)
                    .fill(null)
                    .map((item, k) => listItem(key + k, k !== 0));
                } else return listItem(key, false);
              })}
            </ul>

            {/*Link pagination bar */}
            <div className="mb-8 flex flex-row justify-center">
              <ul className="flex flex-1 flex-row flex-wrap items-center justify-center border-b-2 shadow-sm">
                {linkListPageButtonKeys.map((key) => (
                  <li key={key}>
                    <button
                      className={cn(
                        "border-t-[3px] border-transparent p-3",
                        {
                          "border-blue-400 font-semibold": linkListFirstItemIndex === key * LINK_ITEM_PER_PAGE,
                        },
                        {
                          "hover:border-slate-300": linkListFirstItemIndex !== key * LINK_ITEM_PER_PAGE,
                        },
                        {
                          hidden:
                            numberOfLinkListPages > 9 &&
                            !generateVisiblePaginationButtonKeys(
                              linkListPageButtonKeys,
                              linkListFirstItemIndex / LINK_ITEM_PER_PAGE,
                            ).includes(key),
                        },
                      )}
                      onClick={() => setLinkListFirstItemIndex(key * LINK_ITEM_PER_PAGE)}
                    >
                      {(key + 1).toString().padStart(2, "0")}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/*Detailed view of the selected link */}
          {linkListItems.length > 0 ? (
            <div className="flex basis-2/3 flex-col">
              <div className="p-2">
                {/*Custom Link Name and Action Buttons*/}
                <div className="flex flex-row justify-center p-3 max-lg:flex-col">
                  <input
                    type="text"
                    className={cn(
                      "bg-transparent text-center font-serif text-2xl font-semibold text-gray-900 focus:outline-none",
                      {
                        "border-b-2 border-gray-400": nameEditingView,
                      },
                    )}
                    value={nameInputValue.length > 0 ? nameInputValue : linkListItems.at(activeLinkListItemIndex)?.name}
                    onChange={(event) => {
                      setNameInputValue(event.target.value);
                    }}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") {
                        if (nameEditingView) {
                          let currentItem = linkListItems.at(activeLinkListItemIndex);
                          if (currentItem?.shortURL && nameInputValue.length > 0)
                            updateLinkItemCustomName(currentItem?.shortURL, nameInputValue);
                        }
                        setNameEditingView(!nameEditingView);
                      }
                    }}
                    disabled={!nameEditingView}
                  />
                  <div className="my-3 flex flex-row justify-center">
                    <button
                      id="edit-link-name-button"
                      className="ml-2 mr-4"
                      onClick={() => {
                        if (nameEditingView) {
                          let currentItem = linkListItems.at(activeLinkListItemIndex);
                          if (currentItem?.shortURL && nameInputValue.length > 0)
                            updateLinkItemCustomName(currentItem?.shortURL, nameInputValue);
                        }
                        setNameEditingView(!nameEditingView);
                      }}
                    >
                      <Image src="/icons/edit_pencil.svg" width={24} height={24} alt="Edit pencil icon" />
                    </button>
                    <button id="delet-link-button" className="mx-2" onClick={() => setDeleteLinkViewActive(true)}>
                      <Image src="/icons/delete_icon.svg" width={24} height={24} alt="Edit pencil icon" />
                    </button>
                  </div>
                </div>

                {/*Short and Original Link data section*/}
                <div className="flex flex-col p-4">
                  <div className="flex flex-row max-sm:flex-col">
                    <div className="my-2 mr-4 flex flex-col max-sm:my-1">
                      <span className="text-lg font-semibold text-gray-700">Short link:</span>
                      <div className="flex flex-row items-center">
                        <span className="ml-1">{linkListItems.at(activeLinkListItemIndex)?.shortURL}</span>
                      </div>
                    </div>
                    <div className="mx-3 flex flex-row max-sm:mx-0">
                      <button
                        className="m-2 inline-flex items-center rounded-2xl bg-blue-500 p-2 text-white"
                        onClick={() => setQrCodeViewActive(true)}
                      >
                        <Image className="mx-1" src="/icons/qr_code_icon.svg" width={28} height={28} alt=""></Image>
                        <span className="mx-1">Get QR Code</span>
                      </button>
                    </div>
                  </div>
                  <div className="my-2 flex flex-col">
                    <div className="flex flex-row items-center">
                      <span className="min-w-fit text-lg font-semibold text-gray-700">Original URL:</span>
                    </div>
                    <textarea
                      className="flex-1 rounded-md bg-transparent p-1"
                      rows={4}
                      readOnly={true}
                      value={linkListItems.at(activeLinkListItemIndex)?.target_url}
                    />
                  </div>
                </div>
              </div>

              {/*Link Analytics Section */}
              <div className="flex flex-row p-4 max-md:flex-col">
                {/*Redirect counter display*/}
                <div className="mb-11 flex basis-1/3 flex-col items-center md:justify-center">
                  <div className="relative h-40 w-40">
                    <div className="text-center">
                      <span className="min-w-fit text-lg font-semibold text-gray-700">Total clicks</span>
                    </div>
                    <svg className="h-full w-full" viewBox="0 0 100 100">
                      <circle
                        className="stroke-current text-gray-200"
                        strokeWidth="10"
                        cx="50"
                        cy="50"
                        r="40"
                        fill="transparent"
                      ></circle>

                      <circle
                        className="progress-ring__circle  stroke-current text-indigo-500"
                        strokeWidth="10"
                        strokeLinecap="round"
                        cx="50"
                        cy="50"
                        r="40"
                        fill="transparent"
                        strokeDasharray="252"
                        strokeDashoffset={`calc(252 - (252 * ${progressUntilNextPowerOfTen(
                          Number(linkListItems.at(activeLinkListItemIndex)?.redirect_count),
                        )}) / 100)`}
                      ></circle>

                      <text
                        x="50"
                        y="50"
                        fontFamily="Verdana"
                        fontSize="12"
                        textAnchor="middle"
                        alignmentBaseline="middle"
                      >
                        {nFormatter(Number(linkListItems.at(activeLinkListItemIndex)?.redirect_count), 1)}
                      </text>
                    </svg>
                  </div>
                </div>
                {/*Redirect geo data display*/}
                <div className="flex basis-2/3 flex-col justify-center">
                  <SessionMap
                    countryClickCountMap={
                      new Map(
                        linkListItems
                          .at(linkListFirstItemIndex)
                          ?.click_by_country.map((obj) => [obj.value as CountryCodeType, obj.score]),
                      )
                    }
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="mt-4 flex flex-grow basis-2/3 flex-col p-2">
              {/* Empty link list page content */}

              <div className="flex flex-col items-center">
                <Image src="/icons/no_data_undraw.svg" width={80} height={80} alt="You dont have any links yet icon" />
                {originalLinkList.length > 0 ? (
                  <div className="mt-2 text-center">No matching link was found for the search condition.</div>
                ) : (
                  <span className="mt-2 text-center">
                    You don&apos;t have any links yet.
                    <br />
                    Create one to view analytics and create QR codes.
                  </span>
                )}
              </div>
            </div>
          )}

          {/*Delete link view */}
          <div>
            {deleteLinkViewActive ? (
              <ConfirmationView
                title="Delete link?"
                detailedMessage={`Are you sure you want to delete the selected link and its associated data?\nThis action cannot be undone.`}
                proccedButtonText="Delete"
                iconSrc="/icons/delete_undraw.svg"
                onCancel={() => setDeleteLinkViewActive(false)}
                onProceed={() => {
                  let itemToDelete = linkListItems.at(activeLinkListItemIndex);
                  if (itemToDelete?.shortURL) deleteUserLink(itemToDelete?.shortURL);
                }}
              />
            ) : null}
          </div>
          {/*QRCodeSelectorView */}
          <div>
            {qrCodeViewActive ? (
              <QRCodeSelectorView
                shortURL={linkListItems[activeLinkListItemIndex].shortURL}
                onCloseClicked={() => {
                  setQrCodeViewActive(false);
                }}
              />
            ) : null}
          </div>
        </div>
      ) : (
        <div>{/*Todo: Loading animation */}</div>
      )}
    </div>
  );
}
