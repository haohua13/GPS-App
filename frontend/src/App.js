import "./App.css";
import InputTable from "./Table";
import Tablelines from "./Tablelines";
import Figure from "./Figure";
import FigureTable from "./FigureTable";
import Menu from "./Menu";
import "./styles.css"; // Import the CSS file
// Importing modules
import React, { useState, useEffect } from "react";
import {FlaskConnection} from "./WebsocketURL";

// initialize the geodesic module
var geodesic = require("geographiclib-geodesic"),
  geod = geodesic.Geodesic.WGS84;

const FlaskWebsocket = new WebSocket(
    'ws://'+FlaskConnection.IP + ":" + FlaskConnection.port
  );

const App = () => {
  // For AnchorTable
  const [longitude, setLongitude] = useState(0);
  const [latitude, setLatitude] = useState(0);
  const [Anchor_bearing, setBearing] = useState(0);
  const [Anchor_distance, setDistance] = useState(0);
  // map click functionality for anchor set
  const [mapClickActive, setMapClickActive] = useState(false);
  // For AlarmTable
  const [radius, setRadius] = useState(5);
  const [arcRadius, setArcRadius] = useState(10);
  const [angleSwipe, setAngleSwipe] = useState(0);
  const [swipe, setSwipe] = useState(0);
  // real-time vessel position
  const [real_time_vessel, setRealVesselPosition] = useState({
    lat: 0.001,
    long: 0.001,
  });
  // set vessel heading
  const [heading, setHeading] = useState(45);

  const [connection, setConnection] = useState(false);

  FlaskWebsocket.onopen = () => {
    console.log("Websocket connected");
    FlaskWebsocket.send("Hello from React!");
    setConnection(true);
  };

  FlaskWebsocket.onmessage = (message) => {
    console.log(message);
  };

  useEffect(() =>{
    if (connection){
      FlaskWebsocket.send("update")
      console.log("update sent")
      FlaskWebsocket.send('{"radius":'+radius+',"arcRadius":'+arcRadius+',"angleSwipe":'+angleSwipe+',"swipe":'+swipe+',"longitude":'+longitude+',"latitude":'+latitude+'}')
      console.log("lat and long sent")
    }
  }, [radius, arcRadius, angleSwipe, swipe, longitude, latitude])

  return (
    <div className="App" style={{ margin: 0, padding: "0px 0" }}>
      {/* Outer wrapper with the background color for the entire App */}
      <div
        style={{ backgroundColor: "transparent", margin: 0, padding: "0px 0" }}
      >
        {/* Inner wrapper for header and graph */}
        <div style={{ margin: 0, padding: "0px 0" }}>
          <header
            className="App-header"
            style={{ margin: 0, padding: "0px 0" }}
          >
            {/* Set margin and padding for the header elements */}
            <h1 style={{ margin: 0, padding: "0px 0" }}>Anchorage Mode</h1>

            {/* Render the InputTable component inside the inner wrapper */}
            {/* This component contains the user input table (anchor position and anchor area)*/}
            <InputTable
              longitude={longitude}
              setLongitude={setLongitude}
              latitude={latitude}
              setLatitude={setLatitude}
              Anchor_bearing={Anchor_bearing}
              Anchor_distance={Anchor_distance}
              setBearing={setBearing}
              setDistance={setDistance}
              mapClickActive={mapClickActive}
              setMapClickActive={setMapClickActive}
              real_time_vessel={real_time_vessel}
              radius={radius}
              setRadius={setRadius}
              arcRadius={arcRadius}
              setArcRadius={setArcRadius}
              angleSwipe={angleSwipe}
              setAngleSwipe={setAngleSwipe}
              swipe={swipe}
              setSwipe={setSwipe}
            ></InputTable>
            {/* Render the Figure component inside the inner wrapper */}
            {/* This component contains the figure and figure information*/}
            <Figure
              latitude={latitude}
              longitude={longitude}
              setLatitude={setLatitude}
              setLongitude={setLongitude}
              radius={radius}
              arcRadius={arcRadius}
              swipe={swipe}
              angleSwipe={angleSwipe}
              real_time_vessel={real_time_vessel}
              setRealVesselPosition={setRealVesselPosition}
              Anchor_distance={Anchor_distance}
              setDistance={setDistance}
              Anchor_Bearing={Anchor_bearing}
              setBearing={setBearing}
              heading={heading}
              mapClickActive={mapClickActive}
              setMapClickActive={setMapClickActive}
            ></Figure>
            <FigureTable
              Anchor_distance={Anchor_distance}
              Anchor_bearing={Anchor_bearing}
              radius={radius}
              arcRadius={arcRadius}
            ></FigureTable>
            {/* This component contains the instructions + alarm information + gps information + trajectory history*/}
            <Menu></Menu>
          </header>
        </div>
      </div>
    </div>
  );
};
export default App;
