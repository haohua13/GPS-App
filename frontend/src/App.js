import "./App.css";
import InputTable from "./Table";
import Figure from "./Figure";
import Menu from "./Menu";
import "./styles.css"; // Import the CSS file

// Importing modules
import React, { useState, useEffect} from "react";

// initialize the geodesic module
var geodesic = require("geographiclib-geodesic"),
    geod = geodesic.Geodesic.WGS84

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
  const [real_time_vessel, setRealVesselPosition] = useState({lat:0.001, long: 0.001});

  // Function to use current vessel position as anchor position
  const handleUseCurrentPosition = () => {
          setLatitude(real_time_vessel.lat);
          setLongitude(real_time_vessel.long);
        };
  // Function to handle the Apply Relative Position button in the AnchorTable
  const handleApplyValues = () => {
    if (Anchor_distance >= 0 && Anchor_bearing >= 0 && Anchor_bearing <= 360) {
      const vesselPositionCoords = { latitude: real_time_vessel.lat, longitude: real_time_vessel.long };
      const anchorPositionCoords = geod.Direct(vesselPositionCoords.latitude, vesselPositionCoords.longitude, Anchor_bearing, Anchor_distance); 
      setLatitude(anchorPositionCoords.lat2);
      setLongitude(anchorPositionCoords.lon2);
      setBearing(Anchor_bearing);
    } else {
      alert("Please enter valid distance (>= 0) and bearing (0 - 360) values.");
    }
  };

// Here listen to GPS data and send it to the Figure component, and also exchange data between websockets
useEffect(() => {
});

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
              handleUseCurrentPosition={handleUseCurrentPosition}
              handleApplyValues={handleApplyValues}
              Anchor_bearing={Anchor_bearing}
              Anchor_distance={Anchor_distance}
              setBearing={setBearing}
              setDistance={setDistance}
              mapClickActive={mapClickActive}
              
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
              radius={radius}
              arcRadius={arcRadius}
              swipe={swipe}
              angleSwipe={angleSwipe}
              real_time_vessel={real_time_vessel}
              Anchor_distance={Anchor_distance}
              Anchor_Bearing={Anchor_bearing}
            >
            </Figure>

            {/* This component contains the instructions + alarm information + gps information + trajectory history*/}
            <Menu>

            </Menu>

          </header>
        </div>
      </div>
    </div>
  );
};
export default App;
