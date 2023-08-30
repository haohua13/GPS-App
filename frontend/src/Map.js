import React from "react";
import { MapContainer, TileLayer } from "react-leaflet";
import MapOverlay from "./MapBackground";
import L from "leaflet";
import "./styles.css"; // Import the CSS file

//COMO CHAMAR este componente:

/*Incluir um objecto com o size desejado (pode ser hardcoded)

Exemplo:

const size = {width: 1000, height: 1000}

*/

function MapDemo({ info, vessel_lat, vessel_long, inner_radius, outer_radius}) {
  const map = {
    width: info.width,
    height: info.height,
    center: { x: info.width / 2, y: info.height / 2 },
    zoom: 12.5,
  };

  const mapCircles = [5, 10, 20, 30, 50];

  function getMapDistance(map, distance, mapCircles) {
    const maxDistance = mapCircles[mapCircles.length - 1];

    const distanceRatio = distance / maxDistance;

    const mapSize = Math.min(map.center.x, map.center.y);

    return mapSize * distanceRatio;
  }

  return (
    <div>
    <div className="map" style={{ width: map.width, height: map.height }}>
      <svg width={"100%"} height={"100%"}>
        {<g className="map-imageLayer"></g>}
        <g className="map-backgroundLines">
          {mapCircles.map((distance) => {
            let radius = getMapDistance(map, distance, mapCircles);

            return (
              <g key={"distance-circle-" + distance}>
                <circle
                  cx={map.center.x}
                  cy={map.center.y - 4}
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
                  fillOpacity={2}
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
      </svg>
      </div>
      <div className = "map_overlay" style={{ width: 550, height: 550}}>
      <MapOverlay latitude={info.latitude} longitude={info.longitude} vessel_lat = {vessel_lat} vessel_long = {vessel_long} inner_radius = {inner_radius} outer_radius = {outer_radius} />
      </div>
    </div>
  );
}

export default MapDemo;
