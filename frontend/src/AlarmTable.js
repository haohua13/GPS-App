import { useEffect, useState } from "react";
import Tablelines from "./Tablelines";

const AlarmTable = ({
  setRadius,
  radius,
  setArcRadius,
  arcRadius,
  setAngleSwipe,
  angleSwipe,
  setSwipe,
  swipe,
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
      <br></br>
      <Tablelines>
        <button onClick={() => setShowParameters(!showParameters)}>
          Area Estimate
        </button>
      </Tablelines>
      {showParameters && (
        <>
          <Tablelines>
            <strong>
              The recommended swinging radius is {SwingingRadius} meters.
            </strong>
          </Tablelines>
          <br></br>
          <Tablelines>
            Vessel Length:
            <input
              min={0}
              type="number"
              value={VesselLength}
              onChange={(e) => handleVesselLength(parseFloat(e.target.value))}
            />
            [meters]
          </Tablelines>
          <br></br>
          <Tablelines>
            Chain Length:
            <input
              min={DepthOfWater}
              type="number"
              value={ChainLength}
              onChange={(e) => handleChainLength(parseFloat(e.target.value))}
            />
            [meters]
          </Tablelines>
          <br></br>
          <Tablelines>
            Water Depth:
            <input
              min={0}
              type="number"
              max={ChainLength + VesselLength}
              value={DepthOfWater}
              onChange={(e) => handleDepthOfWater(parseFloat(e.target.value))}
            />
            [meters]
          </Tablelines>
          <br></br>
          <Tablelines>
            <button onClick={handleParameters}>Set Area</button>
          </Tablelines>
        </>
      )}
      <br></br>
      <Tablelines>
        Inner Radius:
        <input
          type="number"
          value={radius}
          onChange={(e) => setRadius(parseFloat(e.target.value))}
        />
        [meters]
      </Tablelines>
      <Tablelines>
        <input
          type="range"
          max={arcRadius}
          value={radius}
          onChange={(e) => handleRadiusChange(parseFloat(e.target.value))}
        />
      </Tablelines>
      <br></br>
      <Tablelines>
        Outer Radius:
        <input
          type="number"
          min={radius}
          value={arcRadius}
          onChange={(e) => handleArcRadiusChange(parseFloat(e.target.value))}
        />
        [meters]
      </Tablelines>
      <Tablelines>
        <input
          type="range"
          min={radius}
          max="100"
          value={arcRadius}
          onChange={(e) => handleArcRadiusChange(parseFloat(e.target.value))}
        />
      </Tablelines>
      <br></br>
      <Tablelines>
        Angle Interval Δ = {360 - angleSwipe} degrees:
        <input
          type="range"
          min="0"
          max="360"
          value={angleSwipe}
          onChange={(e) => handleAngleSwipe(parseFloat(e.target.value))}
        />
      </Tablelines>
      <br></br>
      <Tablelines>
        Swipe = {swipe} degrees:
        <input
          type="range"
          min="0"
          max="360"
          value={swipe}
          onChange={(e) => handleSwipe(parseFloat(e.target.value))}
        />
      </Tablelines>
    </div>
  );
};

export default AlarmTable;
