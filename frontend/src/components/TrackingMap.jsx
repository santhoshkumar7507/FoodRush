import React, { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';

const restaurantIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const customerIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const partnerIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

function MapController({ partnerLocation, customerLocation, restaurantLocation }) {
  const map = useMap();
  
  useEffect(() => {
    if (partnerLocation && customerLocation) {
      const bounds = L.latLngBounds([partnerLocation, customerLocation]);
      map.fitBounds(bounds, { padding: [50, 50] });
    } else if (restaurantLocation && customerLocation) {
      const bounds = L.latLngBounds([restaurantLocation, customerLocation]);
      map.fitBounds(bounds, { padding: [50, 50] });
    } else if (partnerLocation) {
      map.setView(partnerLocation, 15);
    }
  }, [partnerLocation, customerLocation, restaurantLocation, map]);
  
  return null;
}

export default function TrackingMap({ restaurantLocation, customerLocation, partnerLocation }) {
  const defaultCenter = [12.9716, 77.5946];
  const center = partnerLocation || restaurantLocation || customerLocation || defaultCenter;

  return (
    <div className="h-64 w-full rounded-xl overflow-hidden shadow-lg border border-slate-700">
      <MapContainer center={center} zoom={13} scrollWheelZoom={false} className="h-full w-full">
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          className="map-tiles"
        />
        
        {restaurantLocation && (
          <Marker position={restaurantLocation} icon={restaurantIcon} />
        )}
        
        {customerLocation && (
          <Marker position={customerLocation} icon={customerIcon} />
        )}
        
        {partnerLocation && (
          <Marker position={partnerLocation} icon={partnerIcon} />
        )}
        
        {partnerLocation && customerLocation && (
          <Polyline positions={[partnerLocation, customerLocation]} color="#FF6B00" weight={4} opacity={0.7} dashArray="10, 10" />
        )}
        {!partnerLocation && restaurantLocation && customerLocation && (
          <Polyline positions={[restaurantLocation, customerLocation]} color="#334155" weight={3} opacity={0.5} dashArray="5, 10" />
        )}
        
        <MapController 
          partnerLocation={partnerLocation} 
          customerLocation={customerLocation} 
          restaurantLocation={restaurantLocation} 
        />
      </MapContainer>
    </div>
  );
}
