"use client";
import QRCodeStyling, { Options } from "qr-code-styling";
import { useRef, useEffect } from "react";
import { useState } from "react";

type QRCodeComponentProps = {
  shortURL: string;
};

const qrCodeStyles: Partial<Options>[] = [
  {
    width: 300,
    height: 300,
    margin: 0,
    qrOptions: { typeNumber: 0, mode: "Byte", errorCorrectionLevel: "H" },
    dotsOptions: { type: "square", color: "#000000" },
    backgroundOptions: { color: "#ffffff" },
    cornersSquareOptions: { type: "square", color: "#000000" },
    cornersDotOptions: { type: "square", color: "#000000" },
  },
  {
    width: 300,
    height: 300,
    margin: 0,
    qrOptions: { typeNumber: 0, mode: "Byte", errorCorrectionLevel: "H" },
    dotsOptions: { type: "rounded", color: "#000000" },
    backgroundOptions: { color: "#ffffff" },
    cornersSquareOptions: { type: "extra-rounded", color: "#000000" },
    cornersDotOptions: { type: "dot", color: "#000000" },
  },
  {
    width: 300,
    height: 300,
    margin: 0,
    qrOptions: { typeNumber: 0, mode: "Byte", errorCorrectionLevel: "H" },
    dotsOptions: { type: "rounded", color: "#00aaff" },
    backgroundOptions: { color: "#ffffff" },
    cornersSquareOptions: { type: "extra-rounded", color: "#00aaff" },
    cornersDotOptions: { type: "dot", color: "#00aaff" },
  },
  {
    width: 300,
    height: 300,
    margin: 0,
    qrOptions: { typeNumber: 0, mode: "Byte", errorCorrectionLevel: "H" },
    dotsOptions: {
      type: "rounded",
      color: "#000000",
      gradient: {
        type: "linear",
        rotation: 0,
        colorStops: [
          { offset: 0, color: "#0590fa" },
          { offset: 1, color: "#ee00ff" },
        ],
      },
    },
    backgroundOptions: { color: "#ffffff" },
    cornersSquareOptions: { type: "extra-rounded", color: "#a200fa" },
    cornersDotOptions: { type: "dot", color: "#9900ff" },
  },
  {
    width: 300,
    height: 300,
    margin: 0,
    qrOptions: { typeNumber: 0, mode: "Byte", errorCorrectionLevel: "H" },
    dotsOptions: {
      type: "dots",
      color: "#6a1a4c",
      gradient: {
        type: "linear",
        rotation: 0,
        colorStops: [
          { offset: 0, color: "#c7298a" },
          { offset: 1, color: "#00e626" },
        ],
      },
    },
    backgroundOptions: { color: "#ffffff" },
    cornersSquareOptions: {
      type: "extra-rounded",
      color: "#000000",
      gradient: {
        type: "linear",
        rotation: 0,
        colorStops: [
          { offset: 0, color: "#e47f21" },
          { offset: 1, color: "#f00000" },
        ],
      },
    },
    cornersDotOptions: { type: "dot", color: "#addb16" },
  },
];

export default function QrCodeComponent(props: QRCodeComponentProps) {
  const ref = useRef(null);
  const [currentStyleIndex, setCurrentStyleIndex] = useState(0);
  const qrCode = new QRCodeStyling(qrCodeStyles[currentStyleIndex]);

  const onDownloadClick = () => {
    qrCode.download({
      name: props.shortURL.split("/").pop(),
      extension: "png",
    });
  };

  useEffect(() => {
    if (ref.current) qrCode.append(ref.current);
    qrCode.update({
      data: props.shortURL,
    });
  });

  return (
    <div className="flex flex-col">
      <div className="p-4">
        <div className="flex justify-center" ref={ref} />
      </div>
      <div className="mt-2 inline-flex justify-center">
        <button
          className="rounded-l bg-gray-500 px-4 py-2 font-bold text-white hover:bg-gray-600"
          onClick={() => {
            if (currentStyleIndex > 0) setCurrentStyleIndex(currentStyleIndex - 1);
            else {
              setCurrentStyleIndex(qrCodeStyles.length - 1);
            }
          }}
        >
          Prev
        </button>
        <button
          className="inline-flex items-center bg-blue-600 px-6 py-2 font-bold text-white hover:bg-blue-700"
          onClick={() => onDownloadClick()}
        >
          <svg className="mr-2 h-4 w-4 fill-current" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
            <path d="M13 8V2H7v6H2l8 8 8-8h-5zM0 18h20v2H0v-2z" />
          </svg>
          <span>Download</span>
        </button>
        <button
          className="rounded-r bg-gray-500 px-4 py-2 font-bold text-white hover:bg-gray-600"
          onClick={() => {
            if (currentStyleIndex < qrCodeStyles.length - 1) setCurrentStyleIndex(currentStyleIndex + 1);
            else {
              setCurrentStyleIndex(0);
            }
          }}
        >
          Next
        </button>
      </div>
    </div>
  );
}
