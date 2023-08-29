import React, { useRef, useEffect} from "react";
import { MapContainer, TileLayer, Marker, Popup, Circle, SVGOverlay } from "react-leaflet";
import L from "leaflet";
const { AnchorSVG } = require("./image_constants");
const { boatIconSVG } = require("./image_constants");

function MapOverlay({ latitude, longitude, vessel_lat, vessel_long, inner_radius, outer_radius}) {
  const mapRef = useRef(null);
  const anchorIcon = L.icon({
    iconUrl: `data:image/svg+xml;base64,${btoa(AnchorSVG)}`, // Convert SVG to base64~
    iconSize: [50, 50],
  });
  const boatIcon = L.icon({
    iconUrl: `data:image/svg+xml;base64,${btoa(boatIconSVG)}`, // Convert SVG to base64~
    iconSize: [75, 75],
  });

  useEffect(() => {
    if (mapRef.current) {
      const map = mapRef.current.leafletElement;
      const anchorMarker = L.marker([latitude, longitude], {
        icon: anchorIcon,
      })
        .bindPopup("Anchor")
      .addTo(map);
      const vesselMarker = L.marker([vessel_lat, vessel_long], {
        icon: boatIcon,
      })
      .bindPopup("Vessel")
      .addTo(map);
      // Cleanup previous markers when props change
      return () => {
        map.removeLayer(anchorMarker);
        map.removeLayer(vesselMarker);
      };
    }
  }, [latitude, longitude, vessel_lat, vessel_long, anchorIcon, boatIcon]);

  useEffect(() => {
    if (mapRef.current) {
      const map = mapRef.current.leafletElement;
      L.map("map", {scrollWheelZoom:false})
      .setView([latitude, longitude], 15);
      
      
      const basemaps = {
        StreetView: L.tileLayer(
          "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
          {
            attribution:
              '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
          }
        ),
        Topography: L.tileLayer.wms(
          "http://ows.mundialis.de/services/service?",
          {
            layers: "TOPO-WMS",
          }
        ),
        Places: L.tileLayer.wms("http://ows.mundialis.de/services/service?", {
          layers: "OSM-Overlay-WMS",
        }),
      };
      L.control.layers(basemaps).addTo(map);
      basemaps.Topography.addTo(map); 
      basemaps.Places.addTo(map);
      

    }
  }, [latitude, longitude, vessel_lat, vessel_long]);

  return (
    <MapContainer
      id="map"
      center={[latitude, longitude]}
      scrollWheelZoom={false}
      maxZoom={25}
      zoom={18}
      
      style={{ height: "100%", width: "100%", opacity: "100%", zIndex: -1}}
      whenCreated={(mapInstance) => (mapRef.current = mapInstance)}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      <Marker position={[latitude, longitude]} icon={anchorIcon}>
        <Popup>Anchor</Popup>
      </Marker>

      <Marker position={[vessel_lat, vessel_long]} icon={boatIcon}>
        <Popup>Vessel</Popup>
        </Marker>
        <Circle center = {[latitude, longitude]} radius = {outer_radius}>
        </Circle>
        <Circle center = {[latitude, longitude]} radius = {inner_radius} pathOptions={{ color: 'green' }}>
        </Circle>


    </MapContainer>
  );
}

export default MapOverlay;
