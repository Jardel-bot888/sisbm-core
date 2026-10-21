import { useEffect, useRef } from "react";
import { CircleMarker, MapContainer, Popup, ScaleControl, TileLayer, useMap } from "react-leaflet";
import { statusConfig } from "@/theme";
import { ABIDJAN_CENTER, ABIDJAN_ZOOM } from "@/data/geo";
import { useGpsFeed } from "@/data/gpsFeed";
import { gpsSample } from "@/data/gpsSample";

function FitAllMarkers({ positions }: { positions: [number, number][] }) {
  const map = useMap();
  const fitted = useRef(false);

  useEffect(() => {
    if (!positions.length || fitted.current) return;
    map.fitBounds(positions, { padding: [32, 32], maxZoom: 13 });
    fitted.current = true;
  }, [map, positions]);

  return null;
}

export default function GpsSnapshotMap() {
  const { vehicles } = useGpsFeed();
  const samplePosition: [number, number] = [gpsSample.latitude, gpsSample.longitude];
  const positions: [number, number][] = [
    ...vehicles.map((vehicle) => [vehicle.lat, vehicle.lng] as [number, number]),
    samplePosition,
  ];

  return (
    <MapContainer
      center={[ABIDJAN_CENTER.lat, ABIDJAN_CENTER.lng]}
      zoom={ABIDJAN_ZOOM}
      scrollWheelZoom
      style={{ height: "100%", width: "100%", minHeight: 320 }}
    >
      <TileLayer
        attribution="&copy; OpenStreetMap contributors"
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        maxZoom={19}
        subdomains="abc"
      />
      <ScaleControl position="bottomleft" imperial={false} />
      <FitAllMarkers positions={positions} />
      {vehicles.map((vehicle) => (
        <CircleMarker
          key={vehicle.plate}
          center={[vehicle.lat, vehicle.lng]}
          radius={6}
          pathOptions={{ color: "#FFFFFF", weight: 2, fillColor: statusConfig[vehicle.status].color, fillOpacity: 1 }}
        >
          <Popup>
            <strong>{vehicle.plate}</strong>
            <br />
            {vehicle.model}
            <br />
            {vehicle.speed} km/h
          </Popup>
        </CircleMarker>
      ))}
      <CircleMarker
        center={samplePosition}
        radius={10}
        pathOptions={{ color: "#FFFFFF", weight: 3, fillColor: "#E85D3F", fillOpacity: 1 }}
      >
        <Popup>
          <strong>{gpsSample.deviceName}</strong>
          <br />
          {gpsSample.ident}
          <br />
          {gpsSample.speed} km/h
        </Popup>
      </CircleMarker>
    </MapContainer>
  );
}