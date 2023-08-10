import Tablelines from "./Tablelines";
import AlarmTable from "./AlarmTable";
import AnchorTable from "./AnchorTable";

const InputTable = ({
  // AnchorTable
  Anchor_bearing, // bearing of the anchor to put on the graph
  Anchor_distance, // distance of the anchor to put on the graph
  setBearing, // state to set the bearing
  setDistance, // state to set the distance
  mapClickActive, // boolean to check if map click is active to set anchor
  setMapClickActive, // state to set the map click active
  longitude, // anchor longitude
  setLongitude, // state to set the longitude
  latitude, // anchor latitude
  setLatitude, // state to set the latitude
  real_time_vessel, // real_time_vessel position
  // AlarmTable
  setRadius, // state to set the radius
  radius, // radius to put on the graph
  setArcRadius, // state to set the arc radius
  arcRadius, // arc radius to put on the graph
  setAngleSwipe, // state to set the angle swipe
  angleSwipe,   // angle swipe to put on the graph
  setSwipe, // state to set the swipe
  swipe, // swipe to put on the graph
}) => {
  return (
    <div>
      <AnchorTable
        Anchor_bearing={Anchor_bearing}
        Anchor_distance={Anchor_distance}
        setBearing={setBearing}
        setDistance={setDistance}
        mapClickActive={mapClickActive}
        setMapClickActive={setMapClickActive}
        longitude={longitude}
        setLongitude={setLongitude}
        latitude={latitude}
        setLatitude={setLatitude}
        real_time_vessel = {real_time_vessel}
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
