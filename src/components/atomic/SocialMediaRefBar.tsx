import React from "react";
import Image from "next/image";

const icons = [
  "discord.svg",
  "facebook.svg",
  "instagram.svg",
  "linkedin.svg",
  "snapchat.svg",
  "telegram.svg",
  "tiktok.svg",
  "twitterx.svg",
  "youtube_shorts.svg",
  "youtube.svg",
];

export default function SocialMediaRefBar() {
  return (
    <div className="flex flex-row flex-wrap">
      {icons.map((icon_name, key) => {
        return (
          <button className="m-1 p-0" key={key}>
            <Image key={key} src={"/icons/social-buttons/" + icon_name} alt={icon_name} width={48} height={48} />
          </button>
        );
      })}
    </div>
  );
}
