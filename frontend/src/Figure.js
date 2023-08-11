import React, { useEffect, useState, useRef } from "react";
import * as d3 from "d3";
import Tablelines from "./Tablelines";
import { io } from "socket.io-client";
import { ReactComponent as MapBoatIcon } from "./images/map-boat.svg";
import Anchor_Alarm from "./images/danger-alarm.mp3";
import AnchorIcon from "./images/anchor.svg.png";
import Compass from "./images/compass.png";
import {ReactComponent as compass_01_v} from "./images/compass_01_v.svg";

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

// generate random position for vessel, testing purposes
function generateRandomPosition(min, max) {
  let value =  Math.random() * (max - min) + min;
  return Number.parseFloat(value);
}


const Figure = ({
  latitude,
  longitude,
  setLatitude,
  setLongitude,
  radius,
  arcRadius,
  swipe,
  angleSwipe,
  real_time_vessel,
  setRealVesselPosition,
  Anchor_distance,
  setDistance,
  Anchor_Bearing,
  setBearing,
  heading,
  mapClickActive,
  setMapClickActive,
}) => {

  const svgRef = useRef(null);
  const graphRef = useRef(null);

  const [AnchorDrag, setAnchorDrag] = useState(false);
  const [dragStart, setDragStart] = useState({x: 0, y: 0});



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

  // This useeffect is to create the figure and the axis once
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
    // Draw Latitude label
    svg.selectAll('text').remove(); // Remove existing labels
    svg
      .append('text')
      .attr('x', width / 2)
      .attr('y', height + margin - 10)
      .attr('text-anchor', 'middle')
      .attr('font-weight', 'bold')
      .text('Longitude [º]');
    // Draw Longitude label
    svg
      .append('text')
      .attr('x', -(height / 2))
      .attr('y', -margin + 20)
      .attr('text-anchor', 'middle')
      .attr('transform', 'rotate(-90)')
      .attr('font-weight', 'bold')
      .text('Latitude [º]');
  }, []);

// this useeffect draws the limits of the figure based on the coordinates of the axis (xScale and yScale)
  useEffect(() => {
        
        const svg = svgRef.current;
        // Draw the x (Longitude) and y (Latitude) axes
        svg.selectAll('g.axes').remove(); // Remove existing center markers
        svg
          .append('g')
          .attr('class', 'axes')
          .attr('transform', `translate(0, ${height / 2})`)
          .call(d3.axisBottom(xScale).tickFormat(d3.format('.6f')));
          
        svg
          .append('g')
          .attr('class', 'axes')
          .attr('transform', `translate(${width / 2}, 0)`)
          .call(d3.axisLeft(yScale).tickFormat(d3.format('.6f')));

  }, [xScale, yScale]);
// this useeffect draws the circle when the radius is changed
  useEffect(() => {
      const svg = svgRef.current;
       // Draw/update the circle
       svg.selectAll('circle.radius-circle').remove(); // Remove existing circles
       svg
         .append('circle')
         .attr('class', 'radius-circle')
         .attr('cx', xScale(longitude))
         .attr('cy', yScale(latitude))
         .attr('r', xScale(real_radius_approx)-xScale(0))
         .attr('stroke', 'black')
         .attr('fill', '#69b3a2')
         .attr('opacity', 0.7);   
  }, [real_radius_approx, xScale, yScale, longitude, latitude]);

  useEffect(() => {
    const svg = svgRef.current;
     // Draw the arc
  svg.selectAll('path.arc').remove(); // Remove existing arcs
  const arcGenerator = d3.arc()
    .innerRadius(0)
    .outerRadius(xScale(real_arcRadius_approx)-xScale(0))
    .startAngle((angleSwipe+swipe+90) * (Math.PI / 180))
    .endAngle((360+swipe+90) * (Math.PI / 180));
  
  svg
    .append('path')
    .attr('class', 'arc')
    .attr('d', arcGenerator)
    .attr('transform', `translate(${xScale(longitude)}, ${yScale(latitude)})`)
    .attr('stroke', 'darkgreen')
    .attr('fill', '#69b3a3')
    .attr('opacity', 0.4);

    // Draw the center marker (circle) at the center coordinates
    svg.selectAll('circle.center-marker').remove(); // Remove existing center markers
    svg
      .append('circle')
      .attr('class', 'center-marker')
      .attr('cx', xScale(longitude))
      .attr('cy', yScale(latitude))
      .attr('r', 5)
      .attr('fill', 'red');
  }
  , [real_arcRadius_approx, angleSwipe, swipe, xScale, yScale, latitude, longitude]);

  // this useEffect draws the legend of the anchor position and listens to the click map to change anchor position
  useEffect(() => {
  // Draw the legend for the anchor position
  const svg = svgRef.current;
  svg.selectAll('text.legend').remove(); // Remove existing legend
  const legendX = 500 - 20; // X-coordinate for the right side of the graph
  svg
    .append('text')
    .attr('class', 'legend')
    .attr('x', legendX) // Position the legend on the right side
    .attr('y', 30) // Offset from the top of the graph
    .attr('text-anchor', 'end') // Anchor the text to the end (right) of the x-coordinate
    .attr('fill', 'red') // Set the fill color to red
    .attr('font-size', '12px') // Set the font size to a smaller value
    .attr('font-weight', 'bold') // Set the font weight to bold
    .text(`Anchor position: (${longitude.toFixed(4)}, ${latitude.toFixed(4)})`);
  },[latitude, longitude]);
  
  useEffect(() => {
    const svg = svgRef.current;
    svg.selectAll('g.boat-icon-group').remove(); // Remove existing boat icons
    const boatIconGroup = svg
      .append('g')
      .attr('class', 'boat-icon-group')
      .attr('transform', `translate(${xScale(real_time_vessel.long)}, ${yScale(real_time_vessel.lat)}) rotate(${heading})`);
  
      boatIconGroup
      .append('image')
      .attr('width', 30) // Set the width of the icon
      .attr('height', 62) // Set the height of the icon
      .attr('x', -15) // Offset the icon horizontally to center it
      .attr('y', -31) // Offset the icon vertically to position it correctly
      .attr('xlink:href', `data:image/svg+xml;utf8,${encodeURIComponent(boatIconSVG)}`);

    svg.selectAll('circle.real_vessel').remove(); // Remove existing real vessel points
    if (svgRef.current && real_time_vessel) {
      const svg = svgRef.current;
      svg 
        .append('circle')
        .attr('class', 'real_vessel')
        .attr('cx', xScale(real_time_vessel.long))
        .attr('cy', yScale(real_time_vessel.lat))
        .attr('r', 3)
        .attr('fill', 'black');
                // Add event listeners for mouse events
                const svgElement = d3.select(graphRef.current).select('svg').node();
                svgElement.addEventListener('mousedown', handleMouseDown);
                svgElement.addEventListener('mousemove', handleMouseMove);
                svgElement.addEventListener('mouseup', handleMouseUp);
              // Clean up event listeners on component unmount
              return () => {
                svgElement.removeEventListener('mousedown', handleMouseDown);
                svgElement.removeEventListener('mousemove', handleMouseMove);
                svgElement.removeEventListener('mouseup', handleMouseUp);
              };
            }
  }, [real_time_vessel, xScale, yScale, heading, AnchorDrag, dragStart, mapClickActive]);
      // Function to handle mouse move event and update the anchor position
      const handleMouseMove = (event) => {
        if (AnchorDrag && mapClickActive) {
          const deltaX = event.clientX - dragStart.x;
          const deltaY = event.clientY - dragStart.y;
          const newX = xScale.invert(xScale(longitude) + deltaX);
          const newY = yScale.invert(yScale(latitude) + deltaY);
          setLatitude(newY);
          setLongitude(newX);
        }
      };
// Function to handle mouse down event and start dragging
const handleMouseDown = (event) => {
setDragStart({ x: event.clientX, y: event.clientY });
setAnchorDrag(true);
};

// Function to handle mouse up event and end dragging
const handleMouseUp = () => {
setAnchorDrag(false);
};
const handleMapClick = (event) => {
  if (mapClickActive){
  const svgElement = d3.select(graphRef.current).select('svg').node();
  const svgRect = svgElement.getBoundingClientRect();
  const mouseX = event.clientX - svgRect.left;
  const mouseY = event.clientY - svgRect.top;

  // Get the X and Y scales from the existing state
  const xScale = d3.scaleLinear().domain([minX, maxX]).range([0, 500]);
  const yScale = d3.scaleLinear().domain([minY, maxY]).range([500, 0]);

  // Calculate the new longitude and latitude based on the clicked coordinates
  const newLongitude = xScale.invert(mouseX)-0.000146;
  const newLatitude = yScale.invert(mouseY)+0.000143;

  const info = geod.Inverse(real_time_vessel.lat, real_time_vessel.long, newLatitude, newLongitude);
  setDistance(info.s12);
  setLatitude(newLatitude);
  setLongitude(newLongitude);
  // Generate random real vessel positions between -0.001 and 0.001
  const randomLatitude = generateRandomPosition(minY, maxY);
  const randomLongitude = generateRandomPosition(minX, maxX);
  setRealVesselPosition({ lat: randomLatitude, long: randomLongitude });
    // bearing between anchor and the vessel position
  setBearing(info.azi1);
  }
  setMapClickActive(false);
};


  return <div>
    <div ref={graphRef} onClick={handleMapClick}></div>
    <img
        src={Compass}
        alt="Compass Icon"
        style={{
          position: 'absolute',
          width: '80px',
          height: 'auto',
          top: `${yScale(latitude+0.0007)}px`,
          left: `${xScale(longitude-0.0007)}px` // Set the opacity value here
        }}
      />
    <img
        src={AnchorIcon}
        alt="Anchor Icon"
        style={{
          position: 'absolute',
          width: '30px',
          height: 'auto',
          top: `${yScale(latitude)}`,
          left: `${xScale(longitude)}`,
          opacity: 1.5, // Set the opacity value here
        }}
      />
  </div>;
};
export default Figure;
