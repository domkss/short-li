"use client";
import QrCodeComponent from "./QrCodeComponent";
import Image from "next/image";
import { Options } from "qr-code-styling";

type QRCodeSelectorViewProps = {
  shortURL: string;
  onCloseClicked: () => void;
};

export default function QRCodeSelectorView(props: QRCodeSelectorViewProps) {
  return (
    <div
      className="confirm-dialog fixed inset-0 z-50 flex items-center justify-center backdrop-blur"
      onClick={() => props.onCloseClicked()}
    >
      <div className="relative min-h-screen px-4 md:flex md:items-center md:justify-center">
        <div className="absolute inset-0 z-10 h-full w-full opacity-25"></div>
        <div
          className="fixed inset-x-0 bottom-0 z-50 mx-auto mb-4 min-w-[50%] rounded-lg border-2 bg-white p-4 shadow-lg md:relative"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex flex-col p-4">
            <div className="flex flex-row p-2">
              <button
                className="flex justify-center rounded-full bg-slate-400 px-2 py-2 align-middle font-bold text-white hover:bg-slate-500"
                onClick={() => props.onCloseClicked()}
              >
                <Image src="/icons/back_arrow_icon.svg" height={24} width={24} alt="<-" />
              </button>
            </div>
            <div className="flex justify-center p-2">
              <span className="font-semibold text-gray-700">{props.shortURL}</span>
            </div>
            <div>
              <QrCodeComponent shortURL={props.shortURL} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
