"use client";

import { WorldSVGData } from "./world-svg-data";
import clsx from "clsx";
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
    <div className='p-3 border-2 mt-5 border-slate-300 shadow-md rounded-md max-sm:min-w-[350px] min-w-[50%]'>
      <div ref={mapContainer}>
        <svg
          baseProfile='tiny'
          fill='#ececec'
          stroke='black'
          strokeLinecap='round'
          strokeLinejoin='round'
          strokeWidth='.2'
          version='1.2'
          viewBox={`${2000 / 2 - zoomx / 2} ${857 / 2 - (zoomx * 0.4285) / 2} ${zoomx} ${zoomx * 0.4285}`}
          xmlns='http://www.w3.org/2000/svg'
        >
          {WorldSVGData.map((item, key) => (
            <path
              className={clsx("stroke-white stroke-[0.5]  hover:stroke-gray-800 hover:stroke-2 hover:cursor-pointer")}
              key={key}
              name={item.name}
              id={item.id}
              d={item.d}
            />
          ))}
        </svg>
      </div>
      <div className='flex flex-row'>
        <div className='flex flex-col mx-1 w-9 h-9 border-[1px]  border-gray-400 rounded-full justify-center align-middle text-center'>
          <button className='text-xl font-extrabold' onClick={() => handleZoom(1)}>
            -
          </button>
        </div>
        <div className='flex flex-col mx-1 w-9 h-9 border-[1px]  border-gray-400 rounded-full justify-center align-middle text-center'>
          <button className='text-lg font-bold' onClick={() => handleZoom(-1)}>
            +
          </button>
        </div>
      </div>
    </div>
  );
}
