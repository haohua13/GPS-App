import React, { useEffect, useState, useRef } from "react";
import * as d3 from "d3";
import Tablelines from "./Tablelines";

const FigureTable = ({ Anchor_distance, Anchor_bearing, radius, arcRadius }) => {
  return (
    <div>
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
  );
};
export default FigureTable;
