import "./App.css";
import InputTable from "./InputTable";
import Figure from "./Figure";
import FigureTable from "./FigureTable";
import Menu from "./Menu";
import Instructions from "./Instructions";
import Trajectory from "./Trajectory";
import MapDemo from "./Map";
import Alarm from "./Alarm";
import MapOverlay from "./MapBackground";
import "./styles.css"; // Import the CSS file
// Importing modules
import React, { useState, useEffect } from "react";
import { FlaskConnection } from "./WebsocketURL";
import { FlaskConnection2 } from "./WebsocketURL";

// initialize the geodesic module
var geodesic = require("geographiclib-geodesic"),
  geod = geodesic.Geodesic.WGS84;

// initialize the websocket connection with port 5000
// const FlaskWebsocket = new WebSocket(
// "ws://" + FlaskConnection.IP + ":" + FlaskConnection.port
// );

// initialize the websocket connection with port 5001
const socket = new WebSocket(
  "ws://" + FlaskConnection2.IP + ":" + FlaskConnection2.port
);

const App = () => {
  // For AnchorTable
  const [longitude, setLongitude] = useState(0.002);
  const [latitude, setLatitude] = useState(0.002);
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
  const [connection2, setConnection2] = useState(false);

  // set alarm status for user data update control
  const [alarmStatus, setAlarmStatus] = useState(false);

  // handle alarm status
  const [alarmLv1, setAlarmLv1] = useState(false);
  const [alarmLv2, setAlarmLv2] = useState(false);

  // set GPS status
  const [GpsStatus, setGpsStatus] = useState(true);

  // set Number of Satellites in View
  const [NumSatellites, setNumSatellites] = useState(0);

  const [pdop, setPdop] = useState(0);
  const [hdop, setHdop] = useState(0);

  // set Battery
  const [Battery, setBattery] = useState(100);

  // set time of message
  const [time, setTime] = useState(0);

  const handleAlarm = () => {
    if (alarmStatus === false) {
      setAlarmStatus(true);
    } else {
      setAlarmStatus(false);
    }
  };

  /* FlaskWebsocket.onopen = () => {
    console.log("Websocket connected");
    FlaskWebsocket.send("Hello from React!");
    setConnection(true);
  };

  FlaskWebsocket.onmessage = (message) => {
    // console.log(message);
    if (message.data.includes("radius")) {
      console.log(message.data);
    }
  }; */

  socket.onopen = () => {
    console.log("Websocket2 connected");
    socket.send("Hello2 from React!");
    setConnection2(true);
  };

  // gets the message from backend
  socket.onmessage = (message) => {
    // console.log(message);
    if (message.data.includes("heading")) {
      let data = JSON.parse(message.data);
      console.log("Message from backend");
      console.log(data);
      setHeading(data.heading);
      setRealVesselPosition({
        lat: data.lat,
        long: data.long,
      });
      setAlarmLv1(data.alarmLv1);
      setAlarmLv2(data.alarmLv2);
      setTime(data.time - time);
      // Set GPS-Status to True when GNSS method is 1 2 or 6 (Active)
      setGpsStatus(
        data.GNSS_method === 1 ||
          data.GNSS_method === 2 ||
          data.GNSS_method === 6
      );
      setNumSatellites(data.n_satellites);
      setPdop(data.pdop);
      setHdop(data.hdop);
      setBattery(100);
    }
  };

  useEffect(() => {
    // only update user data when alarm is off
    console.log(alarmStatus);
    let obj1 = {
      alarmStatus: alarmStatus,
    };
    if (connection2) {
      socket.send(JSON.stringify(obj1));
    }
    if (!alarmStatus) {
      if (connection2) {
        socket.send("alarm status update");
        // send anchor position and anchor area to backend
        let obj = {
          radius: radius,
          arcRadius: arcRadius,
          angleSwipe: angleSwipe,
          swipe: swipe,
          longitude: longitude,
          latitude: latitude,
        };
        socket.send(JSON.stringify(obj));
        console.log("User Data sent");
        console.log(JSON.stringify(obj));
      }
    }
  }, [
    connection,
    radius,
    arcRadius,
    angleSwipe,
    swipe,
    longitude,
    latitude,
    alarmStatus,
  ]);

  return (
    <div className="App" style={{ margin: 0, padding: "0px 0" }}>
      {/* Outer wrapper with the background color for the entire App */}
      <div className="App-container">
        {/* Inner wrapper for header and graph */}
        <div style={{ margin: 0, padding: "0px 0" }}>
          <header
            className="App-header"
            style={{ margin: 0, padding: "0px 0" }}
          >
            {/* Set margin and padding for the header elements */}
            <div class="App-title">
              <h1>Anchorage Mode</h1>
            </div>

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
              disabled={alarmStatus}
            ></InputTable>
            <Alarm
              alarmStatus={alarmStatus}
              alarmLv1={alarmLv1}
              alarmLv2={alarmLv2}
              handleAlarm={handleAlarm}
            ></Alarm>
            {/* Component for trajectory tracking */}
            <Trajectory
              latitude={latitude}
              longitude={longitude}
              real_time_vessel={real_time_vessel}
            ></Trajectory>

            {/* Render the Figure component inside the inner wrapper */}
            {/* This component contains the figure and figure information*/}
            <div className="figure-layout-container">
              {/*This compoennt contains the instructions + alarm information */}
              <div className="instructions-column">
                <Instructions></Instructions>
              </div>

              <div className="figure-column">
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
                  real_time_vessel={real_time_vessel}
                ></FigureTable>
              </div>
              {/* This component contains the gps information + trajectory history*/}

              <div className="menu-column">
                <Menu
                  time={time}
                  GpsStatus={GpsStatus}
                  NumSatellites={NumSatellites}
                  Battery={Battery}
                ></Menu>
              </div>
            </div>
          </header>
        </div>
      </div>
    </div>
  );
};
export default App;
