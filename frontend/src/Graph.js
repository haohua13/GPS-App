import React, { useEffect, useState, useRef } from 'react';
import * as d3 from 'd3';
import {io} from "socket.io-client";
import WebSocketCall from "./WebSocketCall";

// outside of your component, initialize the socket variable
import {ReactComponent as MapBoatIcon} from './images/map-boat.svg';
import Anchor_Alarm from './images/danger-alarm.mp3'  ;
import AnchorIcon from './images/anchor.svg.png';
import Compass from './images/compass.png';

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
    geod = geodesic.Geodesic.WGS84

// generate random position for vessel, testing purposes
function generateRandomPosition(min, max) {
  let value =  Math.random() * (max - min) + min;
  return Number.parseFloat(value);
}

const Graph = () => {

  // let user set the latitude and longitude of anchor
  const [latitude, setLatitude] = useState(0);
  const [longitude, setLongitude] = useState(0);

  const [r1, setR1] = useState(null);

  const svgRef = useRef(null);
  const graphRef = useRef(null);
  const [radius, setRadius] = useState(5); // Default radius

  // let user set the arc radius and angle
  const [arcRadius, setArcRadius] = useState(10);

  // let user swipe the arc
  const [swipe, setSwipe] = useState(0);

  // let user swipe the angle interval
  const [angleSwipe, setAngleSwipe] = useState(0);

  // real-time vessel position
  const [real_time_vessel, setRealVesselPosition] = useState({lat:0.001, long: 0.001});

  // Alarm level 1 info
  const [Alarm_lv1, setAlarm_lv1] = useState(false);

  // Alarm level 2 info
  const [Alarm_lv2, setAlarm_lv2] = useState(false);

  // set vessel heading
  const [heading, setHeading] = useState(45);

  // Anchor Alarm sound
  const GPSAlarm= new Audio(Anchor_Alarm);

  // set Anchor Position using relative position (distance and bearing)
  const [Anchor_distance, setDistance] = useState(5);
  const [Anchor_bearing, setBearing] = useState(0);

  // To show the relative position
  const [showRelativePosition, setShowRelativePosition] = useState(false);

  // map click functionality for anchor set
  const [mapClickActive, setMapClickActive] = useState(false);

  const [AnchorDrag, setAnchorDrag] = useState(false);
  const [dragStart, setDragStart] = useState({x: 0, y: 0});

  // state to manage trajetory saving
  const [saveTrajectory, setSaveTrajectory] = useState(false);
  const [savedAnchorPositions, setSavedAnchorPositions] = useState([]);
  const [savedVesselPositions, setSavedVesselPositions] = useState([]);
  const [showSavedPositions, setShowSavedPositions] = useState(false);
  
  const [ButtonGPS, setButtonGPS] = useState(false);

  // connect frontend to the backend node server to receive data
  // const socketio = io("http://localhost:5000", {transports: ['websocket']}, {cors: {origin: 'http://localhost:3000'}});

  // connect to the backend python server to emit data
  // const socket = io('ws://localhost:5000',{transports: ['websocket']}, {cors: {origin: 'http://localhost:3000'}})

  // Function to start saving the vessel anchor position 
    const handleStartSaving = () => {
      setSaveTrajectory(true);
      setSavedAnchorPositions([{ latitude, longitude }]);
      setSavedVesselPositions([{ latitude: real_time_vessel.lat, longitude: real_time_vessel.long }]);
    };

    // Function to stop saving the vessel anchor positions
    
    const handleStopSaving = () => {
      setSaveTrajectory(false);
      setSavedAnchorPositions((prev) => [...prev, { latitude, longitude }]);
      setSavedVesselPositions((prev) => [...prev, { latitude: real_time_vessel.lat, longitude: real_time_vessel.long }]);
    };
  
  // to let user define the Vessel Length/Chain Length -Depth of Water
  const [showParameters, setShowParameters] = useState(false);
  const [VesselLength, setVesselLength] = useState(0);
  const [ChainLength, setChainLength] = useState(0);
  const [DepthOfWater, setDepthOfWater] = useState(0);
  const [SwingingRadius, setSwingingRadius] = useState(0);

  

  // this is to obtain the coordinates of the axis
  const point_up = geod.Direct(latitude, longitude, 90, 80);
  const point_down = geod.Direct(latitude, longitude, 270, 80);
  const point_left = geod.Direct(latitude, longitude, 0, 80);
  const point_right = geod.Direct(latitude, longitude, 180, 80);

  const minX = Math.min(point_up.lon2, point_down.lon2, point_left.lon2, point_right.lon2);
  const maxX = Math.max(point_up.lon2, point_down.lon2, point_left.lon2, point_right.lon2);
  const minY = Math.min(point_up.lat2, point_down.lat2, point_left.lat2, point_right.lat2);
  const maxY = Math.max(point_up.lat2, point_down.lat2, point_left.lat2, point_right.lat2);


  const point = geod.Direct(latitude, longitude, 90, radius);
  const point2 = geod.Direct(latitude, longitude, 90, arcRadius);

  const real_radius_approx = Math.sqrt(Math.pow(longitude - point.lon2, 2) + Math.pow(latitude - point.lat2, 2));
  const real_arcRadius_approx = Math.sqrt(Math.pow(longitude - point2.lon2, 2) + Math.pow(latitude - point2.lat2, 2));
  const xScale = d3.scaleLinear().domain([1*minX, 1*maxX]).range([0, 500]);
  const yScale = d3.scaleLinear().domain([1*minY, 1*maxY]).range([500, 0]);


  // local state to use socket throughout the app
  const [socketInstance, setSocketInstance] = useState("");
  const [loading, setLoading] = useState(true);
  

  useEffect(() => {
    const width = 500;
    const height = 500;
    const margin = 50;
          

      if (ButtonGPS === true) {
        // Connect to the backend node server Flask (5000) to receive data from React (3000)
        const socket = io("http://localhost:5000/", {
          transports: ["websocket"],
          cors: {
            origin: "http://localhost:3000/",
          },
        })

      setSocketInstance(socket);

      socket.on("connect", (data) => {
          console.log(data);
      });

      setLoading(false);

      socket.on("disconnect", (data) => {
          console.log(data);
      });

      return function cleanup(){
        socket.disconnect();
      };
      };


      


  

        // Listen for 'gps_data' event from the backend
        /*
        socket.on('gps_data', (data) => {
          console.log(data);
          setRealVesselPosition({lat: data.lat, long: data.long});
          setHeading(data.heading);
          setAlarm_lv1(data.alarm_1);
          setAlarm_lv2(data.alarm_2);
          if(data.alarm_2){
            GPSAlarm.play(); 
          }
        });*/
        
    // socketio.emit('user_data', {latitude, longitude, radius, arcRadius, swipe, angleSwipe});

    // Check if the SVG element already exists
    const svgExists = d3.select(graphRef.current).select('svg').size() > 0;
    const svg = svgExists
      ? d3.select(graphRef.current).select('svg').select('g')
      : d3
          .select(graphRef.current)
          .append('svg')
          .attr('width', width + margin * 2)
          .attr('height', height + margin * 2)
          .append('g')
          .attr('transform', `translate(${margin},${margin})`);
    const graphWidth = width+margin;
    const graphHeight = height + margin;

    svg.selectAll('line.border-line').remove(); // Remove existing border lines
svg
  // up
  .append('line')
  .attr('class', 'border-line')
  .attr('x1', -margin)
  .attr('y1', -margin)
  .attr('x2', graphWidth)
  .attr('y2', -margin)
  .attr('stroke', 'black');

svg
  // down
  .append('line')
  .attr('class', 'border-line')
  .attr('x1', -margin)
  .attr('y1', graphHeight)
  .attr('x2', graphWidth)
  .attr('y2', graphHeight)
  .attr('stroke', 'black');

svg
  // left
  .append('line')
  .attr('class', 'border-line')
  .attr('x1', -margin)
  .attr('y1', -margin)
  .attr('x2', -margin)
  .attr('y2', graphHeight)
  .attr('stroke', 'black');

svg
  // right
  .append('line')
  .attr('class', 'border-line')
  .attr('x1', graphWidth)
  .attr('y1', -margin)
  .attr('x2', graphWidth)
  .attr('y2', graphHeight)
  .attr('stroke', 'black');

    // Store the SVG element in the useRef
    svgRef.current = svg;
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

    // Draw Latitude label
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
  // Draw the legend for the circle marker
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
                // socket.disconnect();
                // socketio.disconnect();
              };
    }
  }, [latitude, longitude, radius, arcRadius, swipe, angleSwipe, heading, real_arcRadius_approx, real_radius_approx, real_time_vessel, xScale, yScale, saveTrajectory, ButtonGPS, AnchorDrag, dragStart, mapClickActive]);

    useEffect(()  => {
      const width = 500;
      const height = 500;
      const svg = svgRef.current;

      
      // Add grid lines for the entire graph area
    svg.selectAll('g.grid-lines').remove(); // Remove existing boat icons
    svg
    .append('g')
    .attr('class', 'grid-lines')
    .selectAll('.horizontal-grid-line')
    .data(yScale.ticks())
    .enter()
    .append('line')
    .attr('class', 'grid-line')
    .attr('x1', 0)
    .attr('y1', (d) => yScale(d))
    .attr('x2', width)
    .attr('y2', (d) => yScale(d))
    .attr('stroke', 'lightgray')
    .attr('stroke-opacity', 0.6)
    .attr('stroke-dasharray', '2,2');

  svg
    .append('g')
    .attr('class', 'grid-lines')
    .selectAll('.vertical-grid-line')
    .data(xScale.ticks())
    .enter()
    .append('line')
    .attr('class', 'grid-line')
    .attr('x1', (d) => xScale(d))
    .attr('y1', 0)
    .attr('x2', (d) => xScale(d))
    .attr('y2', height)
    .attr('stroke', 'lightgray')
    .attr('stroke-opacity', 0.6)
    .attr('stroke-dasharray', '2,2');
    let interval;
    if (saveTrajectory) {
      interval = setInterval(() => {
        setSavedAnchorPositions((prev) => [...prev, { latitude, longitude }]);
        // Replace these with actual real_time_vessel.lat and real_time_vessel.long values
        setSavedVesselPositions((prev) => [...prev, { latitude: real_time_vessel.lat, longitude: real_time_vessel.long }]);
      }, 5000); // Save every 5 seconds (adjust as needed)
    }
    // This cleanup function will clear the interval when the component unmounts or saveTrajectory is set to false.
    return () => clearInterval(interval);
    }, [xScale, yScale, latitude, longitude, real_time_vessel, saveTrajectory]);

    const handleRadiusChange = (value) => {
        setRadius(value);
      };
    const handleArcRadiusChange = (value) => {
        setArcRadius(value);
        if (value<radius){
          setRadius(value);
        }
      };  
    const handleSwipe = (value) => {
        setSwipe(value);

    };
    const handleAngleSwipe = (value) => {
        setAngleSwipe(value);
    };
    
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

        const distance = geod.Inverse(real_time_vessel.lat, real_time_vessel.long, newLatitude, newLongitude);
        setR1(distance);
        setLatitude(newLatitude);
        setLongitude(newLongitude);
        // Generate random real vessel positions between -0.001 and 0.001
        const randomLatitude = generateRandomPosition(minY, maxY);
        const randomLongitude = generateRandomPosition(minX, maxX);
        setRealVesselPosition({ lat: randomLatitude, long: randomLongitude });
          // bearing between anchor and the vessel position
        setBearing(distance.azi1);
        }
        setMapClickActive(false);
      };

      // Handles Relative Position Inputs
      const handleApplyValues = () => {
        if (Anchor_distance >= 0 && Anchor_bearing >= 0 && Anchor_bearing <= 360) {
          const vesselPositionCoords = { latitude: real_time_vessel.lat, longitude: real_time_vessel.long };
          const anchorPositionCoords = geod.Direct(vesselPositionCoords.latitude, vesselPositionCoords.longitude, Anchor_bearing, Anchor_distance);

          setLatitude(anchorPositionCoords.lat2);
          setLongitude(anchorPositionCoords.lon2);
          setBearing(Anchor_bearing);
          setShowRelativePosition(false);

        } else {
          alert("Please enter valid distance (>= 0) and bearing (0 - 360) values.");
        }
      };

      // Function to use current vessel position as anchor position
    const handleUseCurrentPosition = () => {
      setLatitude(real_time_vessel.lat);
      setLongitude(real_time_vessel.long);
    };

    const handleClick = () => {
      if (ButtonGPS === false) {
        setButtonGPS(true);
      } else {
        setButtonGPS(false);
      }
    };



      // Listen for 'gps_data' event from the backend
      /*
      socket.on('gps_data', (data) => {
      console.log(data);
      setRealVesselPosition({lat: data.lat, long: data.long});
      setHeading(data.heading);
      setAlarm_lv1(data.alarm_1);
      setAlarm_lv2(data.alarm_2);
      if(data.alarm_2){
              GPSAlarm.play(); 
              }
      });
      setButtonGPS(false);

    };*/

    const handleVesselLength = (value) => {
        setVesselLength(value);
        handleSwingingRadius();
    }
    const handleChainLength = (value) => {
        setChainLength(value);
        handleSwingingRadius();
    }
    const handleDepthOfWater = (value) => {
        setDepthOfWater(value);
        handleSwingingRadius();
    }
    const handleSwingingRadius = () =>{
      const recommended_swinging_radius = VesselLength + ChainLength - DepthOfWater;
      setSwingingRadius(recommended_swinging_radius);
    }
    const handleParameters = () => {
      if (DepthOfWater >= 0 && VesselLength >= 0 && ChainLength >=DepthOfWater) {
        const recommended_swinging_radius = VesselLength + ChainLength - DepthOfWater;
        if(recommended_swinging_radius>0){
          setSwingingRadius(recommended_swinging_radius);
          setShowParameters(false);
          setArcRadius(recommended_swinging_radius);
          setRadius(recommended_swinging_radius);
        }
      } else {
        alert("Please enter valid values.");
      }
    };
    return <inputTable></inputTable>
    return (
        <div className = "anchor_container">
        <div className = "input_container">
          <div>
          <div>
      {/* Use the imported PNG image with width auto and height auto */}
      <img src={AnchorIcon} alt="Anchor Icon" style={{ width: '50px', height: 'auto' }} />
        </div>
        {!ButtonGPS ? (
        <button onClick={handleClick}>GPS ON</button>
      ) : (
        <>
          <button onClick={handleClick}>GPS OFF</button>
          <div className="line">
            {!loading && <WebSocketCall socket={socketInstance} />}
          </div>
        </>
      )}

    <div><strong>Anchor Position:</strong></div>
            <p><button onClick={handleUseCurrentPosition}>Current Position</button></p>

            <div><button onClick={() => setShowRelativePosition(!showRelativePosition)}>Relative Position</button></div>

            <div>{showRelativePosition && (
  <div>
    <div>
      Distance:
      <input
        type="number"
        min = {0}
        value={Anchor_distance}
        onChange={(e) => setDistance(parseFloat(e.target.value))}
      />
      [meters]
    </div>
    <div>
      Bearing:
      <input
        type="number"
        value={Anchor_bearing}
        onChange={(e) => setBearing(parseFloat(e.target.value))}
      />
      [degrees]
    </div>
    <button onClick={handleApplyValues}>Set Anchor</button>
  </div>
)}</div>
<div><p><button onClick={() => setMapClickActive(!mapClickActive)}>Set Anchor Position on Map</button></p></div>

          <div>
            Longitude:
            <input
              type="number"
              value={longitude}
              onChange={(e) => setLongitude(parseFloat(e.target.value))}
            />[º]
          </div>
          Latitude:
            <input
              type="number"
              value={latitude}
              onChange={(e) => setLatitude(parseFloat(e.target.value))}
            />[º]
          </div>

          <div>
          <div><p><strong>Anchor Alarm Zone:</strong></p></div>
          <div><p><button onClick={() => setShowParameters(!showParameters)}>Area Estimate</button></p></div>
        
          <div>{showParameters && (
          <div>
          <strong>The recommended swinging radius is {SwingingRadius} meters.</strong>
          <div>
          Vessel Length:
          <input
          min = {0}
          type="number"
          value={VesselLength}
          onChange={(e) => handleVesselLength(parseFloat(e.target.value))}

          />
          [meters]
          </div>
          <div>
          Chain Length:
          <input
          min = {0}
          type="number"
          value={ChainLength}
          onChange={(e) => handleChainLength(parseFloat(e.target.value))}
          />
          [meters]
          <div>
          Water Depth:
          <input
          min = {0}
          type="number"
          value={DepthOfWater}
          onChange={(e) => handleDepthOfWater(parseFloat(e.target.value))}
          />
          [meters]
          </div>
          </div>
        
          <button onClick={handleParameters}>Set Area</button>
          </div>
          )}</div>

            Inner Radius:
            <input
              type="number"
              value={radius}
              onChange={(e) => setRadius(parseFloat(e.target.value))}
            />[meters]
          </div>
          <div>
            <input
              type="range"
              max={arcRadius}
              value={radius}
              onChange={(e) => handleRadiusChange(parseFloat(e.target.value))}
            />
          </div>

          <div>
          Outer Radius:
          <input
            type="number"
            min = {radius}
            value={arcRadius}
            onChange={(e) => handleArcRadiusChange(parseFloat(e.target.value))}
          />[meters]
        </div>
        <div>
            <input
              type="range"
              min = {radius}
              max="100"
              value={arcRadius}
              onChange={(e) => handleArcRadiusChange(parseFloat(e.target.value))}
            />
          </div>
        
        <div>
        <div>
          <div></div>
            Angle Interval Δ = {360-angleSwipe} degrees:
            <input
              type="range"
              min="0"
              max="360"
              value={angleSwipe}
              onChange={(e) => handleAngleSwipe(parseFloat(e.target.value))}
            />
          </div>

          Swipe = {swipe} degrees:
            <input
              type="range"
              min="0"
              max="360"
              value={swipe}
              onChange={(e) => handleSwipe(parseFloat(e.target.value))}

              
            />
          </div>
          </div>
        <div className = "graph_container" style={{ position: 'relative', display: 'inline-block' } }>
        <div ref={graphRef} onClick={handleMapClick}></div>
              <img
        src={AnchorIcon}
        alt="Anchor Icon"
        style={{
          position: 'absolute',
          width: '30px',
          height: 'auto',
          top: `${yScale(latitude - 0.000095)}px`,
          left: `${xScale(longitude + 0.0001)}px`,
          opacity: 1.5, // Set the opacity value here
        }}
      />
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
   <div className="alarm">
    <div>ANCHOR_ALARM Status</div>
    
    <div >Inner Alarm:</div>
    <div style={{ color: 'red' }}>{Alarm_lv1 ? 'True' : 'False'}</div>
    
    <div>Outer Alarm:</div>
    <div style={{ color: 'red' }}>{Alarm_lv2 ? 'True' : 'False'}</div>

  </div>


    <div className = "graph_instructions_text">
          <p> Instructions</p>
          <div> 1. Set the Anchor Position by:
            <div>Current Position</div>
            <div>Relative Position (Bearing and Distance from the Vessel)</div>
            <div>Map Click</div>
            <div>Manual Coordinates Input</div>
          </div>
          <p> 2. Set the Anchor Alarm zone:</p>
          <div>Vessel Length, Chain Length and Depth of Water</div>
          <div>Manual Switch</div>
        </div>

        <div className = "gps_info_text">
        <div>
        <div>Trajectory History</div>
        <button onClick={handleStartSaving} disabled={saveTrajectory}>
          Start Saving
        </button>
        <button onClick={handleStopSaving} disabled={!saveTrajectory}>
          Stop Saving
        </button>
      </div>
      <div>
        
  <div><button onClick={() => setShowSavedPositions(!showSavedPositions)}>Saved Positions</button></div>
  {showSavedPositions && (
    <div>
      <h3>Saved Positions:</h3>
      <ul>
        <div>Anchor</div>
        {savedAnchorPositions.map((pos, index) => (
          <li key={index}>
            {index+1}. Longitude: {pos.longitude.toFixed(6)}, Latitude: {pos.latitude.toFixed(6)}
          </li>
        ))}
        <div>Vessel</div>
        {savedVesselPositions.map((pos, index) => (
          <li key={index}>
            {index+1}. Longitude: {pos.longitude.toFixed(6)}, Latitude: {pos.latitude.toFixed(6)}
          </li>
        ))}
      </ul>
    </div>
  )}
</div>

          <p> GPS Information
          </p>
          <div>GPS Accuracy</div>
          <div>Number of Satellites in View</div>
          <div>GPS Battery</div>
          <div>Last GPS Update</div>
          <p>Cancel Alarm Button</p>

        </div>
      </div>
      
      
      <div className = "real_time_info">
      <div>
          <MapBoatIcon />
        </div>
      <div>
        <strong>Vessel Position:</strong>
      </div>
      <div style={{ color: 'black' }}>
        Real-Time Longitude: {real_time_vessel.long.toFixed(6)}
      </div>
      <div style={{ color: 'black' }}>
        Real-Time Latitude: {real_time_vessel.lat.toFixed(6)}
      </div>
    </div>
      {r1!== null && (
        <div
          className="info-container"      >
          <div>
            <strong>Distance:</strong> {r1.s12.toFixed(2)} meters
          </div>
          <div>
            <div>
            <strong>Anchor Bearing:</strong> {Anchor_bearing.toFixed(2)} degrees
            </div>
            <strong>Inner Radius:</strong> {radius.toFixed(2)} meters
          </div>
          <div>
            <strong>Outer Radius:</strong> {arcRadius.toFixed(2)} meters
            </div>
        </div>

      )}
    </div>

  );
};
    export default Graph;