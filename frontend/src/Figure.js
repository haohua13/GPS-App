import React, { useEffect, useState, useRef } from "react";
import * as d3 from "d3";
import { io } from "socket.io-client";
import WebSocketCall from "./WebSocketCall";

import { ReactComponent as MapBoatIcon } from "./images/map-boat.svg";
import Anchor_Alarm from "./images/danger-alarm.mp3";
import AnchorIcon from "./images/anchor.svg.png";
import Compass from "./images/compass.png";

const boatIconSVG = `
<svg width="30" height="62" viewBox="0 0 30 62" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M9.61675 50.2597C9.61675 50.2597 7 47.2254 7 34.9943C7 22.7632 13.8338 7 15.0833 7L15.1225 7.00471C16.4688 7.31491 23.1667 22.8855 23.1667 34.9943C23.1667 47.2254 20.5499 50.2597 20.5499 50.2597C20.5499 50.2597 19.7283 51.4583 15.0833 51.4583C10.4384 51.4583 9.61675 50.2597 9.61675 50.2597Z" fill="white"/>
<path fill-rule="evenodd" clip-rule="evenodd" d="M9.17023 37.3715C9.96074 35.9445 19.8637 35.9445 21.0279 37.3715C21.5626 38.027 20.1619 48.8137 19.2108 49.7471C17.3085 50.6804 12.5527 50.6804 10.6505 49.7471C9.69931 48.8137 8.61981 38.365 9.17023 37.3715Z" fill="url(#paint0_linear_3852_10900)"/>
<defs>
<filter id="filter0_f_3852_10900" x="0.75" y="0.75" width="28.6667" height="61" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
<feFlood flood-opacity="0" result="BackgroundImageFix"/>
<feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape"/>
<feGaussianBlur stdDeviation="3.125" result="effect1_foregroundBlur_3852_10900"/>
</filter>
<linearGradient id="paint0_linear_3852_10900" x1="14.9306" y1="36.2134" x2="14.9306" y2="50.6804" gradientUnits="userSpaceOnUse">
<stop stop-opacity="0.14"/>
<stop offset="1" stop-opacity="0.03"/>
</linearGradient>
</defs>
</svg>
`;

// initialize the geodesic module
var geodesic = require("geographiclib-geodesic"),
  geod = geodesic.Geodesic.WGS84;

const Figure = ({
  latitude,
  longitude,
  radius,
  arcRadius,
  swipe,
  angleSwipe,
  real_time_vessel,
  Anchor_distance,
  Anchor_Bearing,
}) => {
  const svgRef = useRef(null);
  const graphRef = useRef(null);
  // this is to obtain the coordinates of the axis and the limits of the figure (scaling)
  const point_up = geod.Direct(latitude, longitude, 90, 80);
  const point_down = geod.Direct(latitude, longitude, 270, 80);
  const point_left = geod.Direct(latitude, longitude, 0, 80);
  const point_right = geod.Direct(latitude, longitude, 180, 80);

  const minX = Math.min(
    point_up.lon2,
    point_down.lon2,
    point_left.lon2,
    point_right.lon2
  );
  const maxX = Math.max(
    point_up.lon2,
    point_down.lon2,
    point_left.lon2,
    point_right.lon2
  );
  const minY = Math.min(
    point_up.lat2,
    point_down.lat2,
    point_left.lat2,
    point_right.lat2
  );
  const maxY = Math.max(
    point_up.lat2,
    point_down.lat2,
    point_left.lat2,
    point_right.lat2
  );

  const point = geod.Direct(latitude, longitude, 90, radius);
  const point2 = geod.Direct(latitude, longitude, 90, arcRadius);
  const real_radius_approx = Math.sqrt(
    Math.pow(longitude - point.lon2, 2) + Math.pow(latitude - point.lat2, 2)
  );
  const real_arcRadius_approx = Math.sqrt(
    Math.pow(longitude - point2.lon2, 2) + Math.pow(latitude - point2.lat2, 2)
  );
  const xScale = d3
    .scaleLinear()
    .domain([1 * minX, 1 * maxX])
    .range([0, 500]);
  const yScale = d3
    .scaleLinear()
    .domain([1 * minY, 1 * maxY])
    .range([500, 0]);
  const width = 500;
  const height = 500;
  const margin = 50;

  useEffect(() => {
    const svgExists = d3.select(graphRef.current).select("svg").size() > 0;
    const svg = svgExists
      ? d3.select(graphRef.current).select("svg").select("g")
      : d3
          .select(graphRef.current)
          .append("svg")
          .attr("width", width + margin * 2)
          .attr("height", height + margin * 2)
          .append("g")
          .attr("transform", `translate(${margin},${margin})`);
    const graphWidth = width + margin;
    const graphHeight = height + margin;
    svg.selectAll("line.border-line").remove(); // Remove existing border lines
    svg
      // up
      .append("line")
      .attr("class", "border-line")
      .attr("x1", -margin)
      .attr("y1", -margin)
      .attr("x2", graphWidth)
      .attr("y2", -margin)
      .attr("stroke", "black");

    svg
      // down
      .append("line")
      .attr("class", "border-line")
      .attr("x1", -margin)
      .attr("y1", graphHeight)
      .attr("x2", graphWidth)
      .attr("y2", graphHeight)
      .attr("stroke", "black");

    svg
      // left
      .append("line")
      .attr("class", "border-line")
      .attr("x1", -margin)
      .attr("y1", -margin)
      .attr("x2", -margin)
      .attr("y2", graphHeight)
      .attr("stroke", "black");

    svg
      // right
      .append("line")
      .attr("class", "border-line")
      .attr("x1", graphWidth)
      .attr("y1", -margin)
      .attr("x2", graphWidth)
      .attr("y2", graphHeight)
      .attr("stroke", "black");

    // Store the SVG element in the useRef
    svgRef.current = svg;
  }, [xScale, yScale]);

  return <div>
            <div ref={graphRef}></div>
  </div>;
};
export default Figure;
