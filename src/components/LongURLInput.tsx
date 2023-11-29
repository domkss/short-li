"use client";
import { useState } from "react";
import clsx from "clsx";

enum ProgressState {
  NotStarted,
  Loading,
  Finished,
}

export default function LongURLInput() {
  const [shortedURL, setShortedURL] = useState("");
  const [progressStatus, setProgressStatus] = useState<ProgressState>(0);

  return (
    <div className='p-4'>
      <div>
        <div className='relative shadow-md rounded-lg'>
          <input
            type='url'
            id='url-input'
            className='pr-[125px] block w-full rounded-lg border border-gray-300 bg-gray-50 p-4 ps-5 text-sm
             text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500'
            placeholder='example.com/long?url'
            disabled={progressStatus == ProgressState.Loading}
          />
          <button
            type='submit'
            onClick={() => {
              setProgressStatus(ProgressState.Loading);
              setShortedURL("Dummy");
            }}
            className={clsx(
              "absolute bottom-2.5 end-2.5 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white",
              progressStatus == ProgressState.Loading
                ? ""
                : "hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-300 flex items-center"
            )}
            disabled={progressStatus == ProgressState.Loading}
          >
            <div className={clsx("inline-block mr-2")}>Short it</div>
            <div
              className={clsx(
                "inline-block h-4 w-4 animate-spin rounded-full border-2 border-solid border-current",
                "border-r-transparent align-[-0.125em] text-primary motion-reduce:animate-[spin_1.5s_linear_infinite] border-white",
                progressStatus !== ProgressState.Loading ? "hidden" : ""
              )}
              role='status'
            />
          </button>
        </div>
      </div>
    </div>
  );
}
