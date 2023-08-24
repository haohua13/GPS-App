import React, { useEffect, useState, useRef } from "react";
import Tablelines from "./Tablelines";
import "./Trajectory.css";

const Trajectory = ({ latitude, longitude, real_time_vessel }) => {
  // state to manage trajetory saving
  const [saveTrajectory, setSaveTrajectory] = useState(false);
  const [savedAnchorPositions, setSavedAnchorPositions] = useState([]);
  const [savedVesselPositions, setSavedVesselPositions] = useState([]);
  const [showSavedPositions, setShowSavedPositions] = useState(false);

  useEffect(() => {
    let interval;
    if (saveTrajectory) {
      interval = setInterval(() => {
        setSavedAnchorPositions((prev) => [...prev, { latitude, longitude }]);
        // Replace these with actual real_time_vessel.lat and real_time_vessel.long values
        setSavedVesselPositions((prev) => [
          ...prev,
          { latitude: real_time_vessel.lat, longitude: real_time_vessel.long },
        ]);
      }, 5000); // Save every 5 seconds (adjust as needed)
    }
    // This cleanup function will clear the interval when the component unmounts or saveTrajectory is set to false.
    return () => clearInterval(interval);
  }, [latitude, longitude, real_time_vessel, saveTrajectory]);

  const handleStartSaving = () => {
    setSaveTrajectory(true);
    setSavedAnchorPositions([{ latitude, longitude }]);
    setSavedVesselPositions([
      { latitude: real_time_vessel.lat, longitude: real_time_vessel.long },
    ]);
  };

  // Function to stop saving the vessel anchor positions

  const handleStopSaving = () => {
    setSaveTrajectory(false);
    setSavedAnchorPositions((prev) => [...prev, { latitude, longitude }]);
    setSavedVesselPositions((prev) => [
      ...prev,
      { latitude: real_time_vessel.lat, longitude: real_time_vessel.long },
    ]);
  };

  return (
    <div>
      <Tablelines>
        <b>Trajectory History</b>
        <div>
        <button class = "start_saving-button" onClick={handleStartSaving} disabled={saveTrajectory}>
          Start Saving
        </button>
        <button class = "stop_saving-button" onClick={handleStopSaving} disabled={!saveTrajectory}>
          Stop Saving
        </button>
        </div>
      </Tablelines>
      <div><button class ="saved_positions" onClick={() => setShowSavedPositions(!showSavedPositions)}>Saved Positions</button></div>
  {showSavedPositions && (
    <div className = "position_history">
      <ul>
        <b>Anchor</b>
        {savedAnchorPositions.map((pos, index) => (
          <li key={index}>
            {index+1}. Longitude: {pos.longitude.toFixed(8)}, Latitude: {pos.latitude.toFixed(8)}
          </li>
        ))}
        <b>Vessel</b>
        {savedVesselPositions.map((pos, index) => (
          <li key={index}>
            {index+1}. Longitude: {pos.longitude.toFixed(4)}, Latitude: {pos.latitude.toFixed(4)}
          </li>
        ))}
      </ul>
    </div>
  )}
    </div>
  );
};
export default Trajectory;
