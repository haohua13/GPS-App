import { useEffect, useState } from "react";
import Tablelines from "./Tablelines";
import "./InputTable.css";

const AlarmTable = ({
  setRadius,
  radius,
  setArcRadius,
  arcRadius,
  setAngleSwipe,
  angleSwipe,
  setSwipe,
  swipe,
  disabled,
}) => {
  const [showParameters, setShowParameters] = useState(false);
  const [VesselLength, setVesselLength] = useState(0);
  const [ChainLength, setChainLength] = useState(0);
  const [DepthOfWater, setDepthOfWater] = useState(0);
  const [SwingingRadius, setSwingingRadius] = useState(0);

  const handleVesselLength = (value) => {
    setVesselLength(value);
  };
  const handleChainLength = (value) => {
    setChainLength(value);
  };
  const handleDepthOfWater = (value) => {
    setDepthOfWater(value);
  };
  const handleSwingingRadius = () => {
    const recommended_swinging_radius =
      parseFloat(VesselLength) +
      parseFloat(ChainLength) -
      parseFloat(DepthOfWater);
    setSwingingRadius(recommended_swinging_radius);
  };

  const handleRadiusChange = (value) => {
    setRadius(value);
  };
  const handleArcRadiusChange = (value) => {
    setArcRadius(value);
    if (value < radius) {
      setRadius(value);
    }
  };
  const handleSwipe = (value) => {
    setSwipe(value);
  };
  const handleAngleSwipe = (value) => {
    setAngleSwipe(value);
  };

  const handleParameters = () => {
    const recommended_swinging_radius =
      VesselLength + ChainLength - DepthOfWater;
    if (recommended_swinging_radius > 0) {
      setSwingingRadius(recommended_swinging_radius);
      setShowParameters(false);
      setArcRadius(recommended_swinging_radius);
      setRadius(recommended_swinging_radius);
    } else {
      alert("Please enter valid values.");
    }
  };

  useEffect(() => {
    handleSwingingRadius();
  }, [VesselLength, ChainLength, DepthOfWater]);

  useEffect(() => {}, [showParameters, radius, arcRadius, angleSwipe, swipe]);

  return (
    <div>
      <Tablelines>
        <strong>Anchor Alarm Zone:</strong>
      </Tablelines>
      <Tablelines>
        <button
          disabled={disabled}
          className = "alarm_input-button"
          onClick={() => setShowParameters(!showParameters)}
        >
          Area Estimate
        </button>
      </Tablelines>
      <div className = "anchor_input-container">
      {showParameters && (
        <>
          <Tablelines>
            <strong>
              The recommended swinging radius is {SwingingRadius} meters.
            </strong>
          </Tablelines>
          <Tablelines>
            Vessel Length:
            <input
              min={0}
              disabled={disabled}
              type="number"
              value={VesselLength}
              onChange={(e) => handleVesselLength(parseFloat(e.target.value))}
            />
            [meters]
          </Tablelines>
          <Tablelines>
            Chain Length:
            <input
              disabled={disabled}
              min={DepthOfWater}
              type="number"
              value={ChainLength}
              onChange={(e) => handleChainLength(parseFloat(e.target.value))}
            />
            [meters]
          </Tablelines>
          <Tablelines>
            Water Depth:
            <input
              min={0}
              disabled={disabled}
              type="number"
              max={ChainLength + VesselLength}
              value={DepthOfWater}
              onChange={(e) => handleDepthOfWater(parseFloat(e.target.value))}
            />
            [meters]
          </Tablelines>
          <Tablelines>
            <button disabled={disabled} onClick={handleParameters}>
              Set Area
            </button>
          </Tablelines>
        </>
      )}
      <Tablelines>
        Inner Radius:
        <input
          type="number"
          disabled={disabled}
          value={radius}
          max={arcRadius}
          onChange={(e) => setRadius(parseFloat(e.target.value))}
        />
        [meters]
      </Tablelines>
      <Tablelines>
        <input
          type="range"
          disabled={disabled}
          max={arcRadius}
          value={radius}
          onChange={(e) => handleRadiusChange(parseFloat(e.target.value))}
        />
      </Tablelines>
      <Tablelines>
        Outer Radius:
        <input
          type="number"
          disabled={disabled}
          min={radius}
          value={arcRadius}
          onChange={(e) => handleArcRadiusChange(parseFloat(e.target.value))}
        />
        [meters]
      </Tablelines>
      <Tablelines>
        <input
          type="range"
          disabled={disabled}
          min={radius}
          max="50"
          value={arcRadius}
          onChange={(e) => handleArcRadiusChange(parseFloat(e.target.value))}
        />
      </Tablelines>
      <Tablelines>
        Angle Interval Δ = {360 - angleSwipe} degrees:
        <input
          type="range"
          disabled={disabled}
          min="0"
          max="360"
          value={angleSwipe}
          onChange={(e) => handleAngleSwipe(parseFloat(e.target.value))}
        />
      </Tablelines>
      <Tablelines>
        Swipe = {swipe} degrees:
        <input
          type="range"
          disabled={disabled}
          min="0"
          max="360"
          value={swipe}
          onChange={(e) => handleSwipe(parseFloat(e.target.value))}
        />
      </Tablelines>
      </div>
    </div>
  );
};

export default AlarmTable;
