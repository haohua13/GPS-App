import React, { useEffect, useState, useRef } from "react";
import Tablelines from "./Tablelines";

const Menu = ({ time, GpsStatus, NumSatellites, Battery }) => {
  return (
    <div>
      <Tablelines>
        <b>GPS Information</b>
      </Tablelines>
      <Tablelines>
        GPS Status
        {/* Show Active or Inactive when GNSS method is 0/1/2/6*/}
        <Tablelines>
          <b>{GpsStatus ? "Active" : "Lost Signal"}</b>
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
          <b>{time.toFixed(2)} [ms]</b>
        </Tablelines>
      </Tablelines>
    </div>
  );
};
export default Menu;
