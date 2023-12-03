"use client";
import { useState } from "react";
import clsx from "clsx";
import { createShortURL } from "@/lib/readis-api";

enum ProgressState {
  NotStarted,
  Loading,
  Finished,
}

export default function LongURLInput() {
  const [urlInputContent, setUrlInputContent] = useState("");
  const [progressStatus, setProgressStatus] = useState<ProgressState>(0);

  async function onSubmitClick() {
    setProgressStatus(ProgressState.Loading);
    setUrlInputContent(await createShortURL(urlInputContent).catch((error) => error));
    setProgressStatus(ProgressState.Finished);
  }

  return (
    <div className='p-4'>
      <div className='relative'>
        <input
          type='url'
          id='url-input'
          className='md:pr-[125px] block w-full rounded-lg border border-gray-300 bg-gray-50 p-5 ps-5 text-sm
             text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 shadow-md'
          placeholder='example.com/long?url'
          value={urlInputContent}
          onChange={(event) => {
            setUrlInputContent(event.target.value);
          }}
          disabled={progressStatus == ProgressState.Loading}
        />
        {/*Inline submit button for large screens*/}
        <div className='max-md:hidden'>
          <button
            type='submit'
            onClick={() => onSubmitClick()}
            className={clsx(
              "absolute bottom-2.5 end-2.5 rounded-lg bg-lime-600 px-4 py-2 text-md text-white",
              progressStatus == ProgressState.Loading
                ? ""
                : "hover:bg-lime-700 focus:outline-none focus:ring-2 focus:ring-blue-300 flex items-center"
            )}
            disabled={progressStatus == ProgressState.Loading}
          >
            <div className={clsx("inline-block mr-2 text-xl")}>Short it</div>
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
      {/*Submit button for mobiles*/}
      <div className='md:hidden mt-3 flex items-center flex-col'>
        <button
          type='submit'
          onClick={() => onSubmitClick()}
          className={clsx(
            "rounded-lg bg-lime-600 py-2 text-sm text-white min-w-[50%]",
            progressStatus == ProgressState.Loading
              ? ""
              : "hover:bg-lime-700 focus:outline-none focus:ring-2 focus:ring-blue-300"
          )}
          disabled={progressStatus == ProgressState.Loading}
        >
          <div className={clsx("inline-block mr-2 text-xl")}>Short it</div>
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
