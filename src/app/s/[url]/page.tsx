"use client";
import LinkTreeView from "@/components/views/LinkTreeView";
import { useEffect, useState } from "react";
import { LinkInBioButtonItem } from "@/lib/common/Types";
import LoadingSpinner from "@/components/atomic/LoadingSpinner";
import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";
import Logo from "/public/icons/shortli_logo.svg";

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

    let avatar_response = await fetch("/api/link-in-bio/avatar?id=" + pageId);
    if (avatar_response.ok) {
      let avatar_blob = await avatar_response.blob();

      let reader = new FileReader();
      reader.onloadend = function () {
        let base64data = reader.result as string;
        setAvatarImage(base64data);
        return;
      };
      reader.readAsDataURL(avatar_blob);
    }

    setContentLoadingFinished(true);
  }

  useEffect(() => {
    getPageData();

    return () => {
      if (avatarImage) {
        URL.revokeObjectURL(avatarImage);
        setAvatarImage("");
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
    <div className="flex min-w-full flex-grow flex-col">
      <div className="p-4">
        <LinkTreeView
          btnList={btnList}
          descriptionText={descriptionText}
          bioPageUrl={bioPageUrl}
          avatarImage={avatarImage}
          immutableView
        />
      </div>
      <div className="flex-1 max-sm:max-h-80" />
      <div className="flex flex-row-reverse p-4">
        <button
          className="flex max-w-[150px] flex-row items-center rounded-md border bg-purple-100 p-2 text-sm shadow-md"
          onClick={() => {
            router.push("/");
          }}
        >
          <Image src={Logo} width={42} height={16} alt="" />
          <div className="text-right">Create Your Own Page</div>
        </button>
      </div>
    </div>
  );
}
