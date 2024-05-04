"use client";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import React from "react";
import { useEffect, useState, useCallback } from "react";
import {
  cn,
  progressUntilNextPowerOfTen,
  generateVisiblePaginationButtonKeys,
  nFormatter,
  debounce,
  countryBgColor,
  range,
} from "@/lib/client/uiHelperFunctions";
import ConfirmationView from "@/components/views/ConfirmationView";
import QRCodeSelectorView from "@/components/views/QRCodeSelectorView";
import { SessionMap, CountryCodeType } from "session-country-map";
import { LinkListItemType, ShortURLSchema } from "@/lib/common/Types";
import copyToClypboard from "copy-to-clipboard";
import LoadingSpinner from "@/components/atomic/LoadingSpinner";
import "./session-map.css";

export default function Dashboard() {
  //#region State variables
  const LIST_ITEM_PER_PAGE = 10;
  const [firstDisplayedListItemIndex, setFirstDisplayedListItemIndex] = useState(0);
  const [originalLinkList, setOriginalLinkList] = useState<LinkListItemType[]>([]);
  const [linkListItems, setLinkListItems] = useState<LinkListItemType[]>([]);

  const numberOfListPages = linkListItems.length / LIST_ITEM_PER_PAGE;
  const listPageButtonKeys = [...Array.from(Array(Math.ceil(numberOfListPages)).keys())];
  const [activeListItemIndex, setActiveListItemIndex] = useState(0);
  const [searchWord, setSearchWord] = useState("");

  const [indexesOfSelectedListItems, setIndexesOfSelectedListItems] = useState<number[]>([]);
  const selectAllListItemCheckboxRef = React.createRef<HTMLInputElement>();

  const [nameEditingView, setNameEditingView] = useState(false);
  const [nameInputValue, setNameInputValue] = useState("");

  const [deleteLinkViewState, setDeleteLinkViewState] = useState({ active: false, bulkDelete: false });
  const [qrCodeViewActive, setQrCodeViewActive] = useState(false);
  const [contentLoadingFinished, setContentLoadingFinished] = useState(false);
  //#endregion

  //#region Authentication check and redirect
  const reactRouter = useRouter();
  const session = useSession();
  let isServer = typeof window === "undefined" ? true : false;
  if (!isServer && (session.status !== "authenticated" || !session.data || !session.data.user))
    reactRouter.replace("/login");
  //#endregion

  //#region GET/POST Data
  async function getUserLinks() {
    let response = await fetch("/api/link");
    if (response.ok) {
      let data = await response.json();
      let linkList: LinkListItemType[] = data.link_data_list;

      if (data.success) {
        if (linkList[0]?.shortURL) {
          setOriginalLinkList(data.link_data_list);
          setLinkListItems(data.link_data_list);
        } else {
          setOriginalLinkList([]);
          setLinkListItems([]);
        }
      } else {
        //Todo: Error message popup
        setOriginalLinkList([]);
        setLinkListItems([]);
      }
    } else {
      //Todo: Display Status Text or error message
    }
    setContentLoadingFinished(true);
  }

  async function deleteUserLink(itemsToDelete: LinkListItemType[]) {
    if (itemsToDelete.length === 0) return;

    let deletedShortURLs = itemsToDelete.map((item) => item.shortURL);

    await itemsToDelete.forEach(async (itemToDelete) => {
      let requestBody: ShortURLSchema = {
        url: itemToDelete.shortURL,
      };

      let result = await fetch("/api/link", {
        method: "DELETE",
        body: JSON.stringify(requestBody),
      });
      if (result.ok) {
        let data = await result.json();
        if (data && !data.success) {
          //Todo: Display error message
        }
      } else {
        //Todo: Display Status Text or error message
      }
    });

    setIndexesOfSelectedListItems([]);

    setOriginalLinkList(originalLinkList.filter((item) => !deletedShortURLs.includes(item.shortURL)));
    setLinkListItems(linkListItems.filter((item) => !deletedShortURLs.includes(item.shortURL)));

    if (activeListItemIndex !== 0) {
      setActiveListItemIndex(activeListItemIndex - deletedShortURLs.length);

      if (activeListItemIndex - deletedShortURLs.length < firstDisplayedListItemIndex)
        setFirstDisplayedListItemIndex(firstDisplayedListItemIndex - LIST_ITEM_PER_PAGE);
    }

    setDeleteLinkViewState({ ...deleteLinkViewState, active: false });
  }

  async function updateLinkItemCustomName(shortURL: string, newCustomName: string) {
    let requestBody: ShortURLSchema = {
      url: shortURL,
      new_custom_name: newCustomName,
    };

    let result = await fetch("/api/link", {
      method: "PATCH",
      body: JSON.stringify(requestBody),
    });
    if (result.ok) {
      let data = await result.json();

      if (data.success) {
        /*Handle name change on list items on client side instead reload all data from server */
        let modifiedLinkListItem = linkListItems.at(activeListItemIndex);
        if (modifiedLinkListItem) {
          modifiedLinkListItem.name = newCustomName;
          let modifiedOriginalLinkList = originalLinkList.filter((item) => item.shortURL !== shortURL);
          modifiedOriginalLinkList.unshift(modifiedLinkListItem);
          setOriginalLinkList(modifiedOriginalLinkList);
          let modifiedLinkList = linkListItems.filter((item) => item.shortURL !== shortURL);
          modifiedLinkList.unshift(modifiedLinkListItem);
          setLinkListItems(modifiedLinkList);
          setActiveListItemIndex(0);
          setFirstDisplayedListItemIndex(0);
        }
      } else {
        //Todo: Display error message
      }
    } else {
      //Todo: Display Status Text or error message
    }
  }

  useEffect(() => {
    getUserLinks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  //#endregion

  //#region List filtering function
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const searchListElements = useCallback(
    debounce((searchWord: string, originalLinkList: LinkListItemType[]) => {
      if (searchWord.trim().length === 0) {
        setLinkListItems(originalLinkList);
      }
      let filteredList = originalLinkList.filter(
        (item) =>
          item.name.toLowerCase().includes(searchWord) ||
          item.shortURL.toLowerCase().includes(searchWord) ||
          item.target_url.toLowerCase().includes(searchWord),
      );
      setLinkListItems(filteredList);
    }, 400),
    [],
  );

  useEffect(() => {
    searchListElements(searchWord, originalLinkList);
  }, [searchWord, originalLinkList, searchListElements]);
  //#endregion

  //Select all list item checkbox state updater
  useEffect(() => {
    if (!selectAllListItemCheckboxRef.current) return;
    //Nothing is selected from the current page
    if (indexesOfSelectedListItems.length === 0) {
      selectAllListItemCheckboxRef.current.indeterminate = false;
      selectAllListItemCheckboxRef.current.checked = false;
      return;
    }

    let numberOfDisplayedListItems =
      firstDisplayedListItemIndex + LIST_ITEM_PER_PAGE < linkListItems.length
        ? LIST_ITEM_PER_PAGE
        : linkListItems.length - firstDisplayedListItemIndex;

    let displayedListItemIndexes = range(numberOfDisplayedListItems, firstDisplayedListItemIndex);

    //One or more element is selected from a hidden list page, unselect them
    if (
      indexesOfSelectedListItems.some(
        (index) => index < firstDisplayedListItemIndex || index >= firstDisplayedListItemIndex + LIST_ITEM_PER_PAGE,
      )
    ) {
      let newSelectedIndexList = indexesOfSelectedListItems.filter((index) => displayedListItemIndexes.includes(index));
      setIndexesOfSelectedListItems(newSelectedIndexList);
    }

    //Every item is selected from the current page
    if (displayedListItemIndexes.every((index) => indexesOfSelectedListItems.includes(index))) {
      selectAllListItemCheckboxRef.current.indeterminate = false;
      selectAllListItemCheckboxRef.current.checked = true;
    }
    //At least one but not every item selected from the current page
    else if (displayedListItemIndexes.some((index) => indexesOfSelectedListItems.includes(index))) {
      selectAllListItemCheckboxRef.current.indeterminate = true;
      selectAllListItemCheckboxRef.current.checked = false;
    }
  }, [indexesOfSelectedListItems, selectAllListItemCheckboxRef, firstDisplayedListItemIndex, linkListItems.length]);

  const resetDetailedView = () => {
    setNameEditingView(false);
    setNameInputValue("");
  };

  //Return Loading Spinner
  if (!contentLoadingFinished)
    return (
      <div className="my-auto">
        <LoadingSpinner />
      </div>
    );

  return (
    <main className="flex flex-grow flex-col">
      <div className="flex flex-grow flex-row max-lg:flex-col">
        {/*Link List */}
        <div className="flex min-h-full basis-1/3 flex-col">
          {/*Link list header */}
          <div className="flex-0 flex flex-col rounded-b-lg border-b-2 border-blue-200 bg-indigo-100 p-3 text-center shadow-md">
            <div className="flex flex-row justify-between">
              <div className="flex flex-row">
                <Image className="m-3" src="/icons/links_undraw.svg" width={38} height={38} alt="My Links icon" />
                <span className="m-3 text-xl font-semibold">My Links</span>
              </div>
              {/*Todo: Create detailed link add page with more options, until then just redirect to the main page */}
              <button
                className="m-3 rounded-lg border-0 bg-blue-500 p-2 text-white shadow-sm"
                onClick={() => reactRouter.replace("/")}
              >
                + Create Link
              </button>
            </div>
            {/*Search bar*/}
            <div className="mt-3 flex flex-row items-center">
              <input
                type="checkbox"
                className="mx-1 h-4 w-4 rounded border-gray-300 bg-gray-100 accent-teal-600 focus:border-0 focus:ring-2 focus:ring-teal-500"
                ref={selectAllListItemCheckboxRef}
                onChange={(e) => {
                  e.stopPropagation();
                  if (e.currentTarget.checked) {
                    setIndexesOfSelectedListItems(
                      range(
                        linkListItems.length >= LIST_ITEM_PER_PAGE ? LIST_ITEM_PER_PAGE : linkListItems.length,
                        firstDisplayedListItemIndex,
                      ),
                    );
                  } else {
                    setIndexesOfSelectedListItems([]);
                  }
                }}
              />
              <button
                id="delet-link-button"
                className="mx-2"
                disabled={indexesOfSelectedListItems.length === 0}
                onClick={() => setDeleteLinkViewState({ ...deleteLinkViewState, active: true, bulkDelete: true })}
              >
                <Image
                  className={cn({ grayscale: indexesOfSelectedListItems.length === 0 })}
                  src="/icons/delete_icon.svg"
                  width={25}
                  height={25}
                  alt="Edit pencil icon"
                  priority
                />
              </button>

              <input
                className="ml-auto min-w-[60%] rounded-md bg-gray-50 p-2 max-sm:w-full"
                placeholder="Search"
                onChange={(event) => {
                  let searchWord = event.target.value.toLowerCase();
                  setSearchWord(searchWord);
                }}
              />
            </div>
          </div>

          {/*Link list */}
          <ul className="mt-1 flex-grow basis-full">
            {linkListItems.map((item, key) => {
              const listItem = (key: number) => {
                return (
                  <li
                    className={
                      firstDisplayedListItemIndex <= key && firstDisplayedListItemIndex + LIST_ITEM_PER_PAGE > key
                        ? ""
                        : "hidden"
                    }
                    key={key}
                  >
                    <button
                      className={cn(
                        "flex min-w-full border-b-[1px] border-slate-100 text-left shadow-sm hover:bg-blue-200",
                        { "bg-emerald-200": key === activeListItemIndex },
                      )}
                      onClick={() => {
                        resetDetailedView();
                        setActiveListItemIndex(key);
                      }}
                    >
                      <div className="flex flex-row flex-nowrap items-center">
                        <input
                          checked={indexesOfSelectedListItems.includes(key)}
                          key={key}
                          type="checkbox"
                          className="ml-4 mr-2 h-4 w-4 rounded border-gray-300 bg-gray-100 accent-teal-600 focus:ring-2 focus:ring-teal-500"
                          onChange={(e) => {
                            e.stopPropagation();
                            if (e.currentTarget.checked) {
                              setIndexesOfSelectedListItems([...indexesOfSelectedListItems, key]);
                            } else {
                              setIndexesOfSelectedListItems([
                                ...indexesOfSelectedListItems.filter((item) => item != key),
                              ]);
                            }
                          }}
                        />
                        <div className="flex flex-col overflow-hidden overflow-ellipsis whitespace-nowrap">
                          <span className="px-2">{item.name}</span>
                          <span className="px-2">{item.shortURL}</span>
                        </div>
                      </div>
                    </button>
                  </li>
                );
              };
              return listItem(key);
            })}
          </ul>

          {/*Link pagination bar */}
          <div className="flex-0 mt-2 flex flex-row justify-center max-sm:mb-8">
            <ul className="flex flex-1 flex-row flex-wrap items-center justify-center border-b-2 shadow-sm">
              {listPageButtonKeys.map((key) => (
                <li key={key}>
                  <button
                    className={cn(
                      "border-t-[3px] border-transparent p-3",
                      {
                        "border-blue-400 font-semibold": firstDisplayedListItemIndex === key * LIST_ITEM_PER_PAGE,
                      },
                      {
                        "hover:border-slate-300": firstDisplayedListItemIndex !== key * LIST_ITEM_PER_PAGE,
                      },
                      {
                        hidden:
                          numberOfListPages > 9 &&
                          !generateVisiblePaginationButtonKeys(
                            listPageButtonKeys,
                            firstDisplayedListItemIndex / LIST_ITEM_PER_PAGE,
                          ).includes(key),
                      },
                    )}
                    onClick={() => setFirstDisplayedListItemIndex(key * LIST_ITEM_PER_PAGE)}
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
                  value={nameInputValue.length > 0 ? nameInputValue : linkListItems.at(activeListItemIndex)?.name}
                  onChange={(event) => {
                    setNameInputValue(event.target.value);
                  }}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      if (nameEditingView) {
                        let currentItem = linkListItems.at(activeListItemIndex);
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
                        let currentItem = linkListItems.at(activeListItemIndex);
                        if (currentItem?.shortURL && nameInputValue.length > 0)
                          updateLinkItemCustomName(currentItem?.shortURL, nameInputValue);
                      }
                      setNameEditingView(!nameEditingView);
                    }}
                  >
                    <Image src="/icons/edit_pencil.svg" width={24} height={24} alt="Edit pencil icon" priority />
                  </button>
                  <button
                    id="delet-link-button"
                    className="mx-2"
                    onClick={() => setDeleteLinkViewState({ ...deleteLinkViewState, active: true, bulkDelete: false })}
                  >
                    <Image src="/icons/delete_icon.svg" width={24} height={24} alt="Edit pencil icon" priority />
                  </button>
                </div>
              </div>

              {/*Short and Original Link data section*/}
              <div className="flex flex-col p-4">
                <div className="flex flex-row max-sm:flex-col">
                  <div className="my-3 mr-4 flex flex-col max-sm:my-1">
                    <span className="text-lg font-semibold text-gray-700">Short link:</span>
                    <div className="flex flex-row items-center">
                      <div
                        className="ml-1 cursor-pointer"
                        onClick={() => {
                          let content = linkListItems.at(activeListItemIndex)?.shortURL?.trim();
                          if (content) copyToClypboard(content);
                        }}
                      >
                        {linkListItems.at(activeListItemIndex)?.shortURL}
                        <Image
                          className="ml-1 inline-block w-6"
                          src="/icons/copy_blue.svg"
                          width={32}
                          height={32}
                          alt="copy-icon"
                          priority
                        />
                      </div>
                    </div>
                  </div>
                  <div className="mx-3 my-2 flex flex-row justify-center max-sm:mx-0">
                    <button
                      className="m-2 inline-flex items-center rounded-xl border-0 bg-blue-500 p-2 text-white shadow-sm"
                      onClick={() => setQrCodeViewActive(true)}
                    >
                      <Image
                        className="mx-1"
                        src="/icons/qr_code_icon.svg"
                        width={28}
                        height={28}
                        alt="QR_Logo"
                        priority
                      />
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
                    value={linkListItems.at(activeListItemIndex)?.target_url}
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
                        Number(linkListItems.at(activeListItemIndex)?.redirect_count),
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
                      {nFormatter(Number(linkListItems.at(activeListItemIndex)?.redirect_count), 1)}
                    </text>
                  </svg>
                </div>
              </div>
              {/*Redirect geo data display*/}
              <div className="flex basis-2/3 flex-col justify-center">
                <SessionMap
                  valueTytle="Clicks"
                  valueByCountryMap={
                    new Map(
                      linkListItems
                        .at(activeListItemIndex)
                        ?.click_by_country.map((obj) => [
                          obj.value as CountryCodeType,
                          { value: obj.score, className: countryBgColor(obj.score) },
                        ]),
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
          {deleteLinkViewState.active ? (
            <ConfirmationView
              title="Delete link?"
              detailedMessage={
                deleteLinkViewState.bulkDelete
                  ? `Are you sure you want to delete the selected ${indexesOfSelectedListItems.length} link and their associated data?\nThis action cannot be undone.`
                  : `Are you sure you want to delete this link and its associated data?\nThis action cannot be undone.`
              }
              proccedButtonText="Delete"
              iconSrc="/icons/delete_undraw.svg"
              onCancel={() => setDeleteLinkViewState({ ...deleteLinkViewState, active: false })}
              onProceed={async () => {
                if (deleteLinkViewState.bulkDelete) {
                  let itemsToDelete = indexesOfSelectedListItems.map((index) => linkListItems.at(index));
                  itemsToDelete = itemsToDelete.filter((item) => item !== undefined);
                  deleteUserLink(itemsToDelete as LinkListItemType[]);
                } else {
                  let itemToDelete = linkListItems.at(activeListItemIndex);
                  if (itemToDelete) deleteUserLink([itemToDelete]);
                }
              }}
            />
          ) : null}
        </div>
        {/*QRCodeSelectorView */}
        <div>
          {qrCodeViewActive ? (
            <QRCodeSelectorView
              shortURL={linkListItems[activeListItemIndex].shortURL}
              onCloseClicked={() => {
                setQrCodeViewActive(false);
              }}
            />
          ) : null}
        </div>
      </div>
    </main>
  );
}
