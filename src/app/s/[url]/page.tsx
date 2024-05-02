"use client";
import LinkTreeView from "@/components/views/LinkTreeView";
import { useEffect, useState } from "react";
import { LinkInBioButtonItem } from "@/lib/common/Types";
import LoadingSpinner from "@/components/atomic/LoadingSpinner";
import { RedirectType, redirect, usePathname, useRouter } from "next/navigation";

export default function LinkTreePage() {
  const [btnList, setBtnList] = useState<LinkInBioButtonItem[]>([]);
  const [descriptionText, setDescriptionText] = useState("");
  const [contentLoadingFinished, setContentLoadingFinished] = useState(false);
  const [bioPageUrl, setBioPageUrl] = useState("");

  const router = useRouter();
  const pathname = usePathname();
  const pageId = pathname.split("/").pop();

  async function getPageData() {
    let response = await fetch("/api/link-in-bio?id=" + pageId);
    let data = await response.json();
    let pageUrl: string = data.page_url;
    let description: string = data.description;
    let linkInBioLinkButtons: LinkInBioButtonItem[] = data.link_buttons;

    if (data.success) {
      setBioPageUrl(pageUrl);
      setDescriptionText(description);
      setBtnList(linkInBioLinkButtons);
    } else {
      router.replace("/");
    }
    setContentLoadingFinished(true);
  }

  useEffect(() => {
    getPageData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  //Return Loading Spinner
  if (!contentLoadingFinished)
    return (
      <div className="my-auto">
        <LoadingSpinner />
      </div>
    );

  return (
    <div className="flex min-w-full flex-col">
      <div className="p-4">
        <LinkTreeView btnList={btnList} descriptionText={descriptionText} bioPageUrl={bioPageUrl} immutableView />
      </div>
    </div>
  );
}
