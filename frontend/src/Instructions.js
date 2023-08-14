import React, { useEffect, useState, useRef } from "react";
import Tablelines from "./Tablelines";

const Instructions = ({
}) => {
  return (
    <div>
        <Tablelines>
            <b>Instructions</b>
        </Tablelines>
        <Tablelines>
            <b> 1. Set the Anchor Position by:</b>
            <div>Current Position</div>
            <div>Relative Position (Bearing and Distance from the Vessel)</div>
            <div>Map Click</div>
            <div>Manual Coordinates Input</div>
        </Tablelines>
        <Tablelines>
            <b> 2. Set the Anchor Alarm zone:</b>
            <div>Vessel Length, Chain Length and Depth of Water</div>
            <div>Manual Switch</div>
        </Tablelines>
    </div>
  );
};
export default Instructions;  