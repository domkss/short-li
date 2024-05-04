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
  const [avatarImage, setAvatarImage] = useState<string>("");
  const [bioPageUrl, setBioPageUrl] = useState("");

  const router = useRouter();
  const pathname = usePathname();
  const pageId = pathname.split("/").pop();

  async function getPageData() {
    let response = await fetch("/api/link-in-bio?id=" + pageId);
    if (response.ok) {
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
    } else {
      router.replace("/");
    }

    let avatar_response = await fetch("/api/link-in-bio/avatar");
    if (avatar_response.ok) {
      let avatar_blob = await avatar_response.blob();
      const imageUrl = URL.createObjectURL(avatar_blob);
      console.log(avatar_blob);
      setAvatarImage(imageUrl);
    }

    setContentLoadingFinished(true);
  }

  useEffect(() => {
    getPageData();

    return () => {
      if (avatarImage) {
        URL.revokeObjectURL(avatarImage);
      }
    };

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
        <LinkTreeView
          btnList={btnList}
          descriptionText={descriptionText}
          bioPageUrl={bioPageUrl}
          avatarImage={avatarImage}
          immutableView
        />
      </div>
    </div>
  );
}
