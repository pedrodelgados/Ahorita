import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { listPlaces } from "../../lib/places";
import { useGeolocation } from "../../hooks/useGeolocation";
import { CHANNEL_COLORS } from "../../styles/theme";
import ChannelFilter from "../places/ChannelFilter";
import WeatherWidget from "./WeatherWidget";

// Centro de Cuenca — usado mientras se obtiene (o si se niega) la geolocalización.
const CUENCA_CENTER = { lat: -2.9006, lng: -79.0045 };

function placeIcon(color) {
  return L.divIcon({
    className: "",
    html: `<div style="width:22px;height:22px;border-radius:50%;background:${color};border:2px solid #fff;box-shadow:0 1px 4px rgba(0,0,0,0.35)"></div>`,
    iconSize: [22, 22],
    iconAnchor: [11, 11],
  });
}

function userIcon() {
  return L.divIcon({
    className: "",
    html: `<div style="width:16px;height:16px;border-radius:50%;background:#5B94C9;border:3px solid #fff;box-shadow:0 0 0 5px rgba(91,148,201,0.25)"></div>`,
    iconSize: [16, 16],
    iconAnchor: [8, 8],
  });
}

export default function MapView({ onSelectPlace }) {
  const { position } = useGeolocation();
  const [channel, setChannel] = useState(null);
  const [places, setPlaces] = useState([]);

  useEffect(() => {
    listPlaces({ channel }).then(setPlaces).catch(() => {});
  }, [channel]);

  const center = position ?? CUENCA_CENTER;

  return (
    <div style={{ position: "relative" }}>
      <div style={{ position: "absolute", top: 10, left: 0, right: 0, zIndex: 500, padding: "0 12px" }}>
        <ChannelFilter selected={channel} onSelect={setChannel} />
      </div>

      <WeatherWidget />

      <MapContainer
        center={[center.lat, center.lng]}
        zoom={15}
        style={{ height: "70svh", width: "100%" }}
        zoomControl={false}
      >
        {/* CARTO Positron: base muteada y elegante (gratis, sin API key) en vez
            del estilo saturado por defecto de OpenStreetMap — más cerca de
            Apple Maps, para que el mapa acompañe al contenido sin competir. */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
          subdomains="abcd"
        />
        {position && <Marker position={[position.lat, position.lng]} icon={userIcon()} />}
        {places
          .filter((place) => place.lat && place.lng)
          .map((place) => (
            <Marker
              key={place.id}
              position={[place.lat, place.lng]}
              icon={placeIcon(CHANNEL_COLORS[place.channel_default] ?? "#E8785C")}
              eventHandlers={{ click: () => onSelectPlace(place) }}
            />
          ))}
      </MapContainer>
    </div>
  );
}
