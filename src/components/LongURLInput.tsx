"use client";
import { useState } from "react";
import clsx from "clsx";
import { isValidHttpURL, addHttpstoURL } from "@/lib/helperFunctions";
import Image from "next/image";
import copyToClypboard from "copy-to-clipboard";
import { useSession } from "next-auth/react";

enum ProgressState {
  NotStarted,
  Loading,
  Finished,
}

export default function LongURLInput() {
  const [urlInputContent, setUrlInputContent] = useState("");
  const [progressStatus, setProgressStatus] = useState<ProgressState>(0);
  const [inputChanged, setInputChanged] = useState<Boolean>(true);
  const session = useSession();

  async function onSubmitClick() {
    if (urlInputContent.trim().length < 1) return;

    if (!inputChanged) {
      //URL is already shorted, copy the content to clipboard
      copyToClypboard(urlInputContent.trim());

      return;
    }

    var constructedUrl = addHttpstoURL(urlInputContent);
    if (!isValidHttpURL(constructedUrl)) return;

    setProgressStatus(ProgressState.Loading);

    let result = await fetch("/api/url", {
      method: "POST",
      body: JSON.stringify({
        url: constructedUrl,
        user: session.data?.user,
      }),
    });

    const data = await result.json();
    if (data.success && data.url) {
      setUrlInputContent(data.url);
    } else {
      setUrlInputContent("Unable to construct the short URL. Please try again later.");
    }

    setInputChanged(false);
    setProgressStatus(ProgressState.Finished);
  }

  function validateInput(target: HTMLInputElement) {
    if (target.value.trim().length < 1) return;
    var constructedUrl = addHttpstoURL(target.value.trim());

    if (!isValidHttpURL(constructedUrl)) {
      target.setCustomValidity("Invalid URL");
    } else target.setCustomValidity("");
    target.reportValidity();
  }

  return (
    <div className='p-4'>
      <div className='relative'>
        <input
          type='text'
          id='url-input'
          className='md:pr-[125px] block w-full rounded-lg border border-gray-300 bg-gray-50 p-5 ps-5 text-sm
             text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 shadow-md'
          placeholder='example.com/long?url'
          value={urlInputContent}
          onChange={(event) => {
            if (progressStatus === ProgressState.Loading) return;
            setUrlInputContent(event.target.value);
            setInputChanged(true);
            validateInput(event.target);
          }}
          onKeyDown={(event) => {
            if (progressStatus === ProgressState.Loading) return;
            if (event.key === "Enter") {
              event.preventDefault();
              onSubmitClick();
            }
          }}
        />
        {/*Inline submit button for large screens*/}
        <div className='max-md:hidden'>
          <button
            type='submit'
            onClick={() => onSubmitClick()}
            className={clsx(
              "absolute bottom-2.5 end-2.5 rounded-lg bg-lime-600 px-4 py-2 text-md font-[500] text-white",
              {
                "hover:bg-lime-700 focus:outline-none focus:ring-2 focus:ring-blue-300 flex items-center":
                  progressStatus != ProgressState.Loading,
              }
            )}
            disabled={progressStatus == ProgressState.Loading}
          >
            <div className={clsx("inline-block mr-2 text-xl", { hidden: !inputChanged })}>Short it</div>
            <div className={clsx("inline-block mr-2 text-xl", { hidden: inputChanged })}>
              Copy
              <Image className='inline-block w-6 ml-2' src='./copy.svg' width={32} height={32} alt='copy-icon' />
            </div>
            <div
              className={clsx(
                "inline-block h-5 w-5 animate-spin rounded-full border-2 border-solid border-current",
                "border-r-transparent text-primary motion-reduce:animate-[spin_1.5s_linear_infinite] border-white",
                { hidden: progressStatus !== ProgressState.Loading }
              )}
              role='status'
            />
          </button>
        </div>
      </div>
      {/*Submit button for mobiles*/}
      <div className='md:hidden mt-3 flex items-center flex-col'>
        <button
          type='submit'
          onClick={() => onSubmitClick()}
          className={clsx("rounded-lg bg-lime-600 py-2 text-sm text-white min-w-[50%] font-[500]", {
            "hover:bg-lime-700 focus:outline-none focus:ring-2 focus:ring-blue-300":
              progressStatus != ProgressState.Loading,
          })}
          disabled={progressStatus == ProgressState.Loading}
        >
          <div className={clsx("inline-block mr-2 text-xl", { hidden: !inputChanged })}>Short it</div>
          <div className={clsx("inline-block mr-2 text-xl", { hidden: inputChanged })}>
            Copy
            <Image className='inline-block w-6 ml-2' src='./copy.svg' width={32} height={32} alt='copy-icon' />
          </div>
          <div
            className={clsx(
              "inline-block h-5 w-5 animate-spin rounded-full border-2 border-solid border-current",
              "border-r-transparent align-[-0.175em] text-primary motion-reduce:animate-[spin_1.5s_linear_infinite] border-white",
              progressStatus !== ProgressState.Loading ? "hidden" : ""
            )}
            role='status'
          />
        </button>
      </div>
    </div>
  );
}
