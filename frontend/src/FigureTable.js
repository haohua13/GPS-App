import React, { useEffect, useState, useRef } from "react";
import Tablelines from "./Tablelines";
import { ReactComponent as MapBoatIcon } from "./images/map-boat.svg";
import "./FigureTable.css";

const FigureTable = ({
  real_time_vessel,
  Anchor_distance,
  Anchor_bearing,
  radius,
  arcRadius,
}) => {
  return (
    <div>
      <Tablelines>
        <MapBoatIcon />
      </Tablelines>
      <Tablelines>
        <strong>Vessel Position:</strong>
      </Tablelines>
      <div className = "figure_table-container">
      <Tablelines style={{ color: "black" }}>
        Real-Time Longitude: {real_time_vessel.long.toFixed(6)}
      </Tablelines>
      <Tablelines style={{ color: "black" }}>
        Real-Time Latitude: {real_time_vessel.lat.toFixed(6)}
      </Tablelines>
      {Anchor_distance !== 0 && (
        <Tablelines>
          <Tablelines>
            <strong>Distance:</strong> {Anchor_distance.toFixed(2)} meters
          </Tablelines>
          <Tablelines>
            <Tablelines>
              <strong>Anchor Bearing:</strong> {Anchor_bearing.toFixed(2)}{" "}
              degrees
            </Tablelines>
            <strong>Inner Radius:</strong> {radius.toFixed(2)} meters
          </Tablelines>
          <Tablelines>
            <strong>Outer Radius:</strong> {arcRadius.toFixed(2)} meters
          </Tablelines>
        </Tablelines>
      )}
      </div>
    </div>
  );
};
export default FigureTable;
