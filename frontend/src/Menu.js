import React, { useEffect, useState, useRef } from 'react';
import * as d3 from 'd3';
import Tablelines from "./Tablelines";

const Menu = ({time}) => {

    return (<div>
        <Tablelines>
    <b>GPS Information</b>
  </Tablelines>
  <Tablelines>
    GPS Accuracy
  </Tablelines>
  <Tablelines>
    Number of Satellites in View
  </Tablelines>
  <Tablelines>
    GPS Battery
  </Tablelines>
  <Tablelines>
    Last GPS update
    <Tablelines>
    {time.toFixed(2)} [ms]
    </Tablelines>
    </Tablelines>

  </div>
    );
};
export default Menu
