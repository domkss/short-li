"use client";

import { WorldSVGData, getCountryCode } from "./world-svg-data";
import { cn } from "@/lib/client/uiHelperFunctions";
import { useEffect, createRef, useState } from "react";
import "/node_modules/flag-icons/css/flag-icons.min.css";

type SessionMapProps = {
  countryClickCountMap?: Map<string, number>;
};

export default function SessionMap(props: SessionMapProps) {
  const mapSVGRef = createRef<SVGSVGElement>();
  const SVG_WIDTH = 2000;
  const SVG_HEIGHT_MULTIPLIER = 0.4285;

  const [hoveredElementCountryName, setHoveredElementCountryName] = useState("");
  const [popUpPosition, setPopUpPosition] = useState({ x: 0, y: 0 });

  const [viewBoxWidth, setViewBoxWidth] = useState(SVG_WIDTH);
  const viewBoxHeight = viewBoxWidth * SVG_HEIGHT_MULTIPLIER;
  const [viewBoxX, setViewBoxX] = useState(0);
  const [viewBoxY, setViewBoxY] = useState(0);
  const [scale, setScale] = useState(1);
  const [isPanning, setIsPanning] = useState(false);
  const [panningStartPoint, setPanningStartPoint] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const svgElement = mapSVGRef.current;
    const handleMouseWheel = (event: WheelEvent) => {
      event.preventDefault();
      event.stopPropagation();
      if (!svgElement) return;
      const { deltaY, offsetX, offsetY } = event;
      const { width, height } = svgElement.getBoundingClientRect();

      let dw = viewBoxWidth * Math.sign(deltaY) * 0.1;
      let dh = viewBoxHeight * Math.sign(deltaY) * 0.1;

      let dx = (dw * offsetX) / width;
      let dy = (dh * offsetY) / height;

      if (viewBoxWidth - dw > 200 && viewBoxWidth - dw < SVG_WIDTH) {
        setViewBoxWidth(viewBoxWidth - dw);
        setViewBoxX(viewBoxX + dx);
        setViewBoxY(viewBoxY + dy);
        setScale(width / viewBoxWidth);
      }
    };
    const handleMouseDown = (event: MouseEvent) => {
      setIsPanning(true);
      setPanningStartPoint({ x: event.pageX, y: event.pageY });
      setHoveredElementCountryName("");
    };
    const handleMouseUp = (event: MouseEvent) => {
      setIsPanning(false);
    };
    const handleMouseMove = (event: MouseEvent) => {
      const minY = 0 - viewBoxHeight / 3;
      const minX = 0 - viewBoxWidth / 3;
      const maxY = SVG_WIDTH * SVG_HEIGHT_MULTIPLIER - viewBoxHeight / 3;
      const maxX = SVG_WIDTH - viewBoxWidth / 3;

      if (isPanning) {
        let panningEndPoint = { x: event.pageX, y: event.pageY };
        var dx = (panningStartPoint.x - panningEndPoint.x) / 75 / (scale / 2);
        var dy = (panningStartPoint.y - panningEndPoint.y) / 75 / (scale / 2);

        if (viewBoxX + dx > minX && viewBoxX + dx < maxX) setViewBoxX(viewBoxX + dx);
        if (viewBoxY + dy > minY && viewBoxY + dy < maxY) setViewBoxY(viewBoxY + dy);

        if (viewBoxX > maxX) setViewBoxX(maxX);
        if (viewBoxX < minX) setViewBoxX(minX);
        if (viewBoxY > maxY) setViewBoxY((SVG_WIDTH * SVG_HEIGHT_MULTIPLIER) / 4);
        if (viewBoxY < minY) setViewBoxY(minY);
      } else {
        setPopUpPosition({ x: event.pageX, y: event.pageY });
      }
    };

    const handleMouseLeave = (event: MouseEvent) => {
      setIsPanning(false);
    };

    if (svgElement) {
      svgElement.addEventListener("wheel", handleMouseWheel);
      svgElement.addEventListener("mousedown", handleMouseDown);
      svgElement.addEventListener("mouseup", handleMouseUp);
      svgElement.addEventListener("mousemove", handleMouseMove);
      svgElement.addEventListener("mouseleave", handleMouseLeave);

      return () => {
        svgElement.removeEventListener("wheel", handleMouseWheel);
        svgElement.removeEventListener("mousedown", handleMouseDown);
        svgElement.removeEventListener("mouseup", handleMouseUp);
        svgElement.removeEventListener("mousemove", handleMouseMove);
        svgElement.removeEventListener("mouseleave", handleMouseLeave);
      };
    }
  });

  const handleZoomButton = (zoomDirection: number) => {
    const svgElement = mapSVGRef.current;
    if (!svgElement) return;
    const { width } = svgElement.getBoundingClientRect();

    let newViewBoxWidth = viewBoxWidth + zoomDirection * 100;
    let newViewBoxX = viewBoxX + viewBoxWidth / 2 - newViewBoxWidth / 2;

    if (newViewBoxWidth > 200 && newViewBoxWidth < SVG_WIDTH) {
      setViewBoxWidth(newViewBoxWidth);
      setViewBoxX(newViewBoxX);
      setScale(width / viewBoxWidth);
    }
  };

  const SVGCountryPath = (className: string, item: { d: string; name: string; id?: string }, key: number) => {
    return (
      <path
        className={className}
        key={key}
        name={item.name}
        id={item.id}
        d={item.d}
        onMouseEnter={() => {
          if (!isPanning) setHoveredElementCountryName(item.name);
        }}
        onMouseLeave={() => {
          if (hoveredElementCountryName === item.name) {
            setHoveredElementCountryName("");
          }
        }}
      />
    );
  };

  return (
    <div className="mt-5 min-w-[50%] select-none rounded-md border-2 border-slate-300 p-3 shadow-md max-sm:min-w-[350px]">
      <div onMouseLeave={() => setHoveredElementCountryName("")}>
        <svg
          baseProfile="tiny"
          fill="#ececec"
          stroke="black"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth=".2"
          version="1.2"
          viewBox={`${viewBoxX} ${viewBoxY} ${viewBoxWidth} ${viewBoxHeight}`}
          xmlns="http://www.w3.org/2000/svg"
          ref={mapSVGRef}
        >
          {WorldSVGData.filter((element) => element.name !== hoveredElementCountryName).map((item, key) =>
            SVGCountryPath(cn("stroke-white stroke-1 hover:cursor-pointer select-none"), item, key),
          )}
          {WorldSVGData.filter((element) => element.name === hoveredElementCountryName).map((item, key) => {
            return SVGCountryPath(cn("stroke-gray-800 stroke-1 hover:cursor-pointer select-none"), item, key);
          })}
        </svg>
        <div
          className={cn("absolute flex flex-col rounded-md border-[1px] bg-white p-2 shadow-sm", {
            hidden: hoveredElementCountryName === "",
          })}
          style={{ left: popUpPosition.x - 50, top: popUpPosition.y - 80 }}
        >
          <div className="flex flex-row">
            <span className={cn("fi mr-2", `fi-${getCountryCode(hoveredElementCountryName).toLowerCase()}`)} />
            <span className="font-bold">{hoveredElementCountryName}</span>
          </div>
          <span className="font-light">
            Clicks: {props.countryClickCountMap?.get(getCountryCode(hoveredElementCountryName)) || "0"}
          </span>
        </div>
      </div>
      <div className="flex flex-row">
        <div className="mx-1 flex h-9 w-9 flex-col justify-center  rounded-full border-[1px] border-gray-400 text-center align-middle">
          <button className="text-xl font-extrabold" onClick={() => handleZoomButton(1)}>
            -
          </button>
        </div>
        <div className="mx-1 flex h-9 w-9 flex-col justify-center  rounded-full border-[1px] border-gray-400 text-center align-middle">
          <button className="text-lg font-bold" onClick={() => handleZoomButton(-1)}>
            +
          </button>
        </div>
      </div>
    </div>
  );
}
