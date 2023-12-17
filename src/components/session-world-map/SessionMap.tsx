"use client";

import { WorldSVGData } from "./world-svg-data";
import clsx from "clsx";
import { useEffect, createRef } from "react";

export default function SessionMap() {
  let zoomx = 2000;
  let zoomy = zoomx * 0.4285;

  const _devBgColors = [
    "fill-gray-300",
    "fill-gray-300",
    "fill-blue-50",
    "fill-blue-100",
    "fill-blue-200",
    "fill-blue-300",
  ];
  const mapContainer = createRef<HTMLDivElement>();

  const handleZoom = () => {};

  useEffect(() => {
    const container = mapContainer.current;
    const handleWheel = (event: any) => {
      event.preventDefault();
      const { deltaY } = event;
      let scrollDirection = deltaY > 0 ? -1 : 1;
      console.log(scrollDirection);
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
          viewBox={`${2000 / 2 - zoomx / 2} ${857 / 2 - zoomy / 2} ${zoomx} ${zoomy}`}
          xmlns='http://www.w3.org/2000/svg'
        >
          {WorldSVGData.map((item, key) => (
            <path
              className={clsx(
                "stroke-white stroke-[0.5]  hover:stroke-gray-800 hover:stroke-2 hover:cursor-pointer",
                _devBgColors[Math.floor(Math.random() * _devBgColors.length)]
              )}
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
          <span className='text-xl font-extrabold'>-</span>
        </div>
        <div className='flex flex-col mx-1 w-9 h-9 border-[1px]  border-gray-400 rounded-full justify-center align-middle text-center'>
          <span className='text-lg font-bold'>+</span>
        </div>
      </div>
    </div>
  );
}
