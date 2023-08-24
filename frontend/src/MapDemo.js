import React from "react";

import { ReactComponent as MapBoatIcon } from "./images/map-boat.svg";

 

//COMO CHAMAR este componente:

/*Incluir um objecto com o size desejado (pode ser hardcoded)

Exemplo:

const size = {width: 1000, height: 1000}

*/

 
function MapDemo({ size }) {

  const map = {

    width: size.width,

    height: size.height,

    center: { x: size.width / 2, y: size.height / 2 },

  };


  const mapCircles = [5, 10, 20, 30, 50];


  function getMapDistance(map, distance, mapCircles) {

    const maxDistance = mapCircles[mapCircles.length-1];

    const distanceRatio = distance / maxDistance;

    const mapSize = Math.min(map.center.x, map.center.y);

    return mapSize * distanceRatio;

  }

 

  return (

    <div className="map" style={{ width: map.width, height: map.height }}>

      <svg width={"100%"} height={"100%"}>

        {

          //ADICIONAS A TUA MAP LAYER AQUI DENTRO

          <g className="map-imageLayer"></g>

        }

 

        <g className="map-backgroundLines">

          {mapCircles.map((distance) => {

            let radius = getMapDistance(map, distance, mapCircles);

 

            return (

              <g key={"distance-circle-" + distance}>

                <circle

                  cx={map.center.x}

                  cy={map.center.y-4}

                  r={radius}

                  stroke={"black"}

                  strokeDasharray={"1, 5"}

                  fillOpacity={0}

                />

                <rect

                  x={map.center.x - 40 / 2}

                  y={map.center.y - radius - 20 / 2}

                  width={40}

                  height={20}

                  rx={8}

                  fill={"black"}

                />

                <text

                  x={map.center.x}

                  y={map.center.y - radius + 5}

                  fontSize={12}

                  fill={"white"}

                  textAnchor={"middle"}

                >

                  {distance}

                </text>

              </g>

            );

          })}

        </g>

 

        <g className="map-sourceBoat">

          <MapBoatIcon

            width={Math.min(map.height, map.width) / 60}

            height={Math.min(map.height, map.width) / 30}

            x={map.center.x - Math.min(map.height, map.width) / 60 / 2}

            y={map.center.y - Math.min(map.height, map.width) / 30 / 2}

          ></MapBoatIcon>

        </g>

      </svg>

    </div>

  );

}

export default MapDemo;