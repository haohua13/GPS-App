import Tablelines from "./Tablelines";
import AlarmTable from "./AlarmTable";
import AnchorTable from "./AnchorTable";

const InputTable = ({
  // AnchorTable
  handleUseCurrentPosition, // sets anchor position using the current GPS position
  handleApplyValues, // sets anchor position based on distance and bearing
  Anchor_bearing,
  Anchor_distance,
  setBearing,
  setDistance,
  mapClickActive, // boolean to check if map click is active to set anchor
  
  longitude,
  setLongitude,
  latitude,
  setLatitude,
  // AlarmTable
  setRadius,
  radius,
  setArcRadius,
  arcRadius,
  setAngleSwipe,
  angleSwipe,
  setSwipe,
  swipe,
}) => {
  return (
    <div>
      <AnchorTable
        handleUseCurrentPosition={handleUseCurrentPosition}
        handleApplyValues={handleApplyValues}
        Anchor_bearing={Anchor_bearing}
        Anchor_distance={Anchor_distance}
        setBearing={setBearing}
        setDistance={setDistance}
        mapClickActive={mapClickActive}
        longitude={longitude}
        setLongitude={setLongitude}
        latitude={latitude}
        setLatitude={setLatitude}
      ></AnchorTable>
      <AlarmTable
        setRadius={setRadius}
        radius={radius}
        setArcRadius={setArcRadius}
        arcRadius={arcRadius}
        setAngleSwipe={setAngleSwipe}
        angleSwipe={angleSwipe}
        setSwipe={setSwipe}
        swipe={swipe}
      ></AlarmTable>
    </div>
  );
};

export default InputTable;
