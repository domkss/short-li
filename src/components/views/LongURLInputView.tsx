"use client";
import { useState } from "react";
import { isValidHttpURL } from "@/lib/client/dataValidations";
import Image from "next/image";
import copyToClypboard from "copy-to-clipboard";
import { cn, addHttpstoURL } from "@/lib/client/uiHelperFunctions";
import { LongURLSchema } from "@/lib/common/Types";

enum ProgressState {
  NotStarted,
  Loading,
  Finished,
}

export default function LongURLInput() {
  const [urlInputContent, setUrlInputContent] = useState("");
  const [progressStatus, setProgressStatus] = useState<ProgressState>(0);
  const [inputChanged, setInputChanged] = useState<Boolean>(true);
  const [copied, setCopied] = useState(false);

  async function onSubmitClick() {
    if (urlInputContent.trim().length < 1) return;

    if (!inputChanged) {
      //URL is already shorted, copy the content to clipboard
      copyToClypboard(urlInputContent.trim());
      setCopied(true);
      return;
    }

    var constructedUrl = addHttpstoURL(urlInputContent);
    if (!isValidHttpURL(constructedUrl)) return;

    setProgressStatus(ProgressState.Loading);
    let requestBody: LongURLSchema = {
      url: constructedUrl,
    };
    let result = await fetch("/api/link", {
      method: "POST",
      body: JSON.stringify(requestBody),
    });

    if (result.ok) {
      const data = await result.json();
      if (data.url) {
        setUrlInputContent(data.url);
      } else {
        setUrlInputContent("Unable to construct the short URL. Please try again later.");
      }
    } else {
      setUrlInputContent("Request failed: " + result.statusText);
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
    <div className="p-4">
      <div className="relative">
        <input
          type="text"
          id="url-input"
          className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-5 ps-5 text-sm text-gray-900
             shadow-md focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 md:pr-[125px]"
          placeholder="example.com/long?url"
          value={urlInputContent}
          onChange={(event) => {
            if (progressStatus === ProgressState.Loading) return;
            setUrlInputContent(event.target.value);
            setInputChanged(true);
            setCopied(false);
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
        <div className="max-md:hidden">
          <button
            type="button"
            onClick={() => onSubmitClick()}
            className={cn(
              "absolute bottom-2.5 end-2.5 flex select-none items-center justify-center rounded-lg bg-emerald-500 px-4 py-2 text-white",
              {
                "flex items-center hover:bg-emerald-600 focus:outline-none focus:ring-2 focus:ring-blue-400":
                  progressStatus != ProgressState.Loading,
              },
            )}
            disabled={progressStatus == ProgressState.Loading}
          >
            <div
              className={cn("mr-2 inline-block text-xl", {
                hidden: !inputChanged,
              })}
            >
              Short it
            </div>
            <div
              className={cn("mr-2 inline-block text-xl", {
                hidden: inputChanged,
              })}
            >
              Copy
              <Image
                className="ml-2 inline-block w-6"
                src={copied ? "/icons/done_icon.gif" : "/icons/copy.svg"}
                width={32}
                height={32}
                alt="copy-icon"
                priority
              />
            </div>
            <div
              className={cn(
                "inline-block h-5 w-5 animate-spin rounded-full border-2 border-solid",
                "text-primary border-white border-r-transparent motion-reduce:animate-[spin_1.5s_linear_infinite]",
                { hidden: progressStatus !== ProgressState.Loading },
              )}
              role="status"
            />
          </button>
        </div>
      </div>
      {/*Submit button for mobiles*/}
      <div className="mt-3 flex flex-col items-center md:hidden">
        <button
          type="button"
          onClick={() => onSubmitClick()}
          className={cn(
            "flex min-w-[50%] select-none items-center justify-center rounded-lg bg-emerald-500 py-2 text-white",
            {
              "hover:bg-emerald-600 focus:outline-none focus:ring-2 focus:ring-blue-400":
                progressStatus != ProgressState.Loading,
            },
          )}
          disabled={progressStatus == ProgressState.Loading}
        >
          <div
            className={cn("mr-2 inline-block text-xl", {
              hidden: !inputChanged,
            })}
          >
            Short it
          </div>
          <div
            className={cn("mr-2 inline-block text-xl", {
              hidden: inputChanged,
            })}
          >
            Copy
            <Image
              className="ml-2 inline-block w-6"
              src={copied ? "/icons/done_icon.gif" : "/icons/copy.svg"}
              width={32}
              height={32}
              alt="copy-icon"
              priority
            />
          </div>
          <div
            className={cn(
              "inline-block h-5 w-5 animate-spin rounded-full border-2 border-solid",
              "text-primary border-white border-r-transparent align-[-0.175em] motion-reduce:animate-[spin_1.5s_linear_infinite]",
              progressStatus !== ProgressState.Loading ? "hidden" : "",
            )}
            role="status"
          />
        </button>
      </div>
    </div>
  );
}
