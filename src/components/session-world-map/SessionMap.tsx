"use client";

import { WorldSVGData } from "./world-svg-data";
import { cn } from "@/lib/client/uiHelperFunctions";
import { useEffect, createRef, useState } from "react";

export default function SessionMap() {
  const [zoomx, setZoomx] = useState(2000);

  const mapContainer = createRef<HTMLDivElement>();

  const handleZoom = (zoomDirection: number) => {
    let newZoom = zoomx + zoomDirection * 100;
    if (newZoom > 200 && newZoom < 2000) setZoomx(newZoom);
  };

  useEffect(() => {
    const container = mapContainer.current;
    const handleWheel = (event: WheelEvent) => {
      event.preventDefault();
      event.stopPropagation();
      const { deltaY } = event;
      let scrollDirection = deltaY > 0 ? 1 : -1;
      handleZoom(scrollDirection);
    };

    if (container) {
      container.addEventListener("wheel", handleWheel);
      return () => {
        container.removeEventListener("wheel", handleWheel);
      };
    }
  }, [mapContainer]);

  return (
    <div className="mt-5 min-w-[50%] rounded-md border-2 border-slate-300 p-3 shadow-md max-sm:min-w-[350px]">
      <div ref={mapContainer}>
        <svg
          baseProfile="tiny"
          fill="#ececec"
          stroke="black"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth=".2"
          version="1.2"
          viewBox={`${2000 / 2 - zoomx / 2} ${857 / 2 - (zoomx * 0.4285) / 2} ${zoomx} ${zoomx * 0.4285}`}
          xmlns="http://www.w3.org/2000/svg"
        >
          {WorldSVGData.map((item, key) => (
            <path
              className={cn("stroke-white stroke-[0.5]  hover:cursor-pointer hover:stroke-gray-800 hover:stroke-2")}
              key={key}
              name={item.name}
              id={item.id}
              d={item.d}
            />
          ))}
        </svg>
      </div>
      <div className="flex flex-row">
        <div className="mx-1 flex h-9 w-9 flex-col justify-center  rounded-full border-[1px] border-gray-400 text-center align-middle">
          <button className="text-xl font-extrabold" onClick={() => handleZoom(1)}>
            -
          </button>
        </div>
        <div className="mx-1 flex h-9 w-9 flex-col justify-center  rounded-full border-[1px] border-gray-400 text-center align-middle">
          <button className="text-lg font-bold" onClick={() => handleZoom(-1)}>
            +
          </button>
        </div>
      </div>
    </div>
  );
}
