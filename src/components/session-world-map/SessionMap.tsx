"use client";

import { WorldSVGData } from "./world-svg-data";

export default function SessionMap() {
  let zoomx = 2000;
  let zoomy = zoomx * 0.4285;
  return (
    <div className='bg-cyan-100'>
      <svg
        className='inline-block'
        baseProfile='tiny'
        fill='#ececec'
        height='500'
        stroke='black'
        stroke-linecap='round'
        stroke-linejoin='round'
        stroke-width='.2'
        version='1.2'
        viewBox={`${2000 / 2 - zoomx / 2} ${857 / 2 - zoomy / 2} ${zoomx} ${zoomy}`}
        width='750'
        xmlns='http://www.w3.org/2000/svg'
      >
        {WorldSVGData.map((item, key) => (
          <path className='hover:stroke-1' key={key} name={item.name} id={item.id} d={item.d} />
        ))}
      </svg>
    </div>
  );
}
