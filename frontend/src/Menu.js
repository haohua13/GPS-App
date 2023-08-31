import Tablelines from "./Tablelines";

const Menu = ({ time, GpsStatus, NumSatellites, Battery, hdop}) => {
  const accuracy= hdop*3;
  return (
    <div>
      <Tablelines>
        <b>GPS Information</b>
      </Tablelines>
      <Tablelines>
        GPS Status
        {/* GNSS Method Inactive(0), Active (1, 2, 6)*/}
        <Tablelines>
          <b>{GpsStatus ? "Lost Signal" : "Active"}</b>
          </Tablelines>
      </Tablelines>
      <Tablelines>
        GPS Accuracy
        <Tablelines>
          <b> 2~5 [m]</b>
        </Tablelines>
      </Tablelines>
      <Tablelines>
        Number of Satellites in View
        <Tablelines>
          <b>{NumSatellites}</b>
        </Tablelines>
      </Tablelines>
      <Tablelines>
        GPS Battery
        <Tablelines>
          <b>{Battery} [%]</b>
        </Tablelines>
        <Tablelines>
        </Tablelines>
      </Tablelines>
      <Tablelines>
        Last GPS update
        <Tablelines>
          <b>{time.toFixed(2)} [s]</b>
        </Tablelines>
      </Tablelines>
      <Tablelines>
        HDOP Accuracy
        <Tablelines>
          <b>{accuracy.toFixed(2)} [m]</b>
        </Tablelines>
      </Tablelines>
    </div>
  );
};
export default Menu;
