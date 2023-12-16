"use client";

import { WorldSVGData } from "./world-svg-data";

export default function SessionMap() {
  let zoomx = 2000;
  let zoomy = zoomx * 0.4285;
  return (
    <div className='p-3 border-2 mt-5 border-slate-300 shadow-md rounded-md max-sm:min-w-[350px] min-w-[50%]'>
      <div>
        <svg
          width='auto'
          height='auto'
          baseProfile='tiny'
          fill='#ececec'
          stroke='black'
          stroke-linecap='round'
          stroke-linejoin='round'
          stroke-width='.2'
          version='1.2'
          viewBox={`${2000 / 2 - zoomx / 2} ${857 / 2 - zoomy / 2} ${zoomx} ${zoomy}`}
          xmlns='http://www.w3.org/2000/svg'
        >
          {WorldSVGData.map((item, key) => (
            <path
              className='stroke-white stroke-[0.5]  hover:stroke-gray-800 hover:stroke-2 hover:cursor-pointer fill-gray-300'
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
