import Tablelines from "./Tablelines";
import { useState, useEffect } from "react";
// initialize the geodesic module
var geodesic = require("geographiclib-geodesic"),
  geod = geodesic.Geodesic.WGS84;

const AnchorTable = ({
  Anchor_bearing,
  Anchor_distance,
  setBearing,
  setDistance,
  real_time_vessel,
  // Anchor Position Based on Map Click
  mapClickActive, // boolean to check if map click is active to set anchor
  setMapClickActive,
  longitude, // anchor position to draw on graph
  setLongitude,
  setLatitude,
  latitude, // anchor position to draw on graph
  disabled, // boolean to check if the alarm is disabled
}) => {
  const [showRelativePosition, setShowRelativePosition] = useState(false);
  useEffect(() => {
    console.log(mapClickActive);
  });

  // Function to use current vessel position as anchor position
  const handleUseCurrentPosition = () => {
    setLatitude(real_time_vessel.lat);
    setLongitude(real_time_vessel.long);
  };
  // Function to handle the Apply Relative Position button in the AnchorTable
  const handleApplyValues = () => {
    if (Anchor_distance >= 0 && Anchor_bearing >= 0 && Anchor_bearing <= 360) {
      const vesselPositionCoords = {
        latitude: real_time_vessel.lat,
        longitude: real_time_vessel.long,
      };
      const anchorPositionCoords = geod.Direct(
        vesselPositionCoords.latitude,
        vesselPositionCoords.longitude,
        Anchor_bearing,
        Anchor_distance
      );
      setLatitude(anchorPositionCoords.lat2);
      setLongitude(anchorPositionCoords.lon2);
      setBearing(Anchor_bearing);
    } else {
      alert("Please enter valid distance (>= 0) and bearing (0 - 360) values.");
    }
  };

  return (
    <div>
      <Tablelines>
        <strong>Anchor Position:</strong>
      </Tablelines>
      <br></br>
      <Tablelines>
        <button onClick={handleUseCurrentPosition} disabled={disabled}>
          Current Position
        </button>
      </Tablelines>
      <br></br>
      <Tablelines>
        <button
          onClick={() => setShowRelativePosition(!showRelativePosition)}
          disabled={disabled}
        >
          Relative Position
        </button>
      </Tablelines>
      {showRelativePosition && (
        <>
          <br></br>
          <Tablelines>
            Distance:
            <input
              type="number"
              min={0}
              value={Anchor_distance}
              disabled={disabled}
              onChange={(e) => setDistance(parseFloat(e.target.value))}
            />
            [meters]
          </Tablelines>
          <br></br>
          <Tablelines>
            Bearing:
            <input
              disabled={disabled}
              type="number"
              value={Anchor_bearing}
              onChange={(e) => setBearing(parseFloat(e.target.value))}
            />
            [degrees]
          </Tablelines>
          <br></br>
          <Tablelines>
            <button
              disabled={disabled}
              onClick={() => {
                handleApplyValues(); // Call the handleApplyValues function
                setShowRelativePosition(!showRelativePosition); // Toggle the showRelativePosition state
              }}
            >
              Set Anchor
            </button>
          </Tablelines>
        </>
      )}
      <br></br>
      <Tablelines>
        <button
          disabled={disabled}
          onClick={() => setMapClickActive(!mapClickActive)}
        >
          Set Anchor Position on Map
        </button>
      </Tablelines>
      <br></br>
      <Tablelines>
        Longitude:
        <input
          disabled={disabled}
          type="number"
          value={longitude}
          onChange={(e) => setLongitude(parseFloat(e.target.value))}
        />
        [º]
      </Tablelines>
      <br></br>
      <Tablelines>
        Latitude:
        <input
          disabled={disabled}
          type="number"
          value={latitude}
          onChange={(e) => setLatitude(parseFloat(e.target.value))}
        />
        [º]
      </Tablelines>
    </div>
  );
};
export default AnchorTable;
