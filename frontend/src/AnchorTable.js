import Tablelines from "./Tablelines";
import { useState, useEffect } from "react";

const AnchorTable = ({
  // Anchor Position Based on Current GPS Position
  handleUseCurrentPosition,
  // Anchor Position Based on Distance and Bearing
  handleApplyValues,
  Anchor_bearing,
  Anchor_distance,
  setBearing,
  setDistance,
  // Anchor Position Based on Map Click
  mapClickActive, // boolean to check if map click is active to set anchor
  longitude, // anchor position to draw on graph
  setLongitude,
  setLatitude,
  latitude, // anchor position to draw on graph
}) => {
  const [showRelativePosition, setShowRelativePosition] = useState(false);
  return (
    <div>
      <Tablelines>
        <strong>Anchor Position:</strong>
      </Tablelines>
      <br></br>
      <Tablelines>
        <button onClick={handleUseCurrentPosition}>Current Position</button>
      </Tablelines>
      <br></br>
      <Tablelines>
        <button onClick={() => setShowRelativePosition(!showRelativePosition)}>
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
              onChange={(e) => setDistance(parseFloat(e.target.value))}
            />
            [meters]
          </Tablelines>
          <br></br>
          <Tablelines>
            Bearing:
            <input
              type="number"
              value={Anchor_bearing}
              onChange={(e) => setBearing(parseFloat(e.target.value))}
            />
            [degrees]
          </Tablelines>
          <br></br>
          <Tablelines>
            <button
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
        <button onClick={() => !mapClickActive}>
          Set Anchor Position on Map
        </button>
      </Tablelines>
      <br></br>
      <Tablelines>
        Longitude:
        <input
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
