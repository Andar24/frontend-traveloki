import { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import L from 'leaflet';
import type { Category, Attraction, Attractions } from '../types';
import { CATEGORY_COLORS, CATEGORY_EMOJIS } from '../constants/attractions';
import 'leaflet/dist/leaflet.css';

interface MapProps {
  attractions: Attractions;
  activeCategories: Record<Category, boolean>;
  searchResult: Attraction | null;
  onLocationUpdate?: (pos: { lat: number; lng: number }) => void;
}

export const Map = ({ attractions, activeCategories, searchResult, onLocationUpdate }: MapProps) => {
  const mapRef = useRef<any>(null);
  const [userPos, setUserPos] = useState<{ lat: number; lng: number } | null>(null);
  const [autoCenter, setAutoCenter] = useState<boolean>(false);
  const firstCenteredRef = useRef<boolean>(false);

  useEffect(() => {
    if (searchResult && mapRef.current) {
      mapRef.current.setView([searchResult.lat, searchResult.lng], 15);
    }
  }, [searchResult]);

  useEffect(() => {
    if (!('geolocation' in navigator)) return;
    let watcher: number | null = null;
    try {
      watcher = navigator.geolocation.watchPosition(
        (pos) => {
          const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
          setUserPos(coords);

          // center map only on first fix or when autoCenter is enabled
          if (mapRef.current && (!firstCenteredRef.current || autoCenter)) {
            try {
              mapRef.current.setView([coords.lat, coords.lng]);
            } catch (e) { /* ignore */ }
            firstCenteredRef.current = true;
          }

          if (onLocationUpdate) onLocationUpdate(coords);
        },
        (err) => {
          console.warn('Geolocation error', err);
        },
        { enableHighAccuracy: true, maximumAge: 0, timeout: 10000 },
      );
    } catch (err) {
      console.warn('Geolocation watch failed', err);
    }

    return () => {
      if (watcher !== null && navigator.geolocation.clearWatch) navigator.geolocation.clearWatch(watcher);
    };
  }, [autoCenter, onLocationUpdate]);

  const createCustomIcon = (category: Category) => {
    return L.divIcon({
      html: `<div style="background-color: ${CATEGORY_COLORS[category]}; width: 30px; height: 30px; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);">
        ${CATEGORY_EMOJIS[category]}
      </div>`,
      iconSize: [30, 30],
      className: 'custom-div-icon',
    });
  };

  const createUserIcon = () => L.divIcon({
    html: `<div style="width:16px;height:16px;border-radius:50%;background:#2563eb;border:3px solid white;box-shadow:0 1px 4px rgba(0,0,0,0.25)"></div>`,
    iconSize: [22, 22],
    className: 'user-location-icon',
  });

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <MapContainer
        center={[3.589, 98.6735] as any}
        zoom={13}
        style={{ width: '100%', height: '100%', borderRadius: '24px' }}
        ref={mapRef}
      >
      <TileLayer
        attribution='© OpenStreetMap contributors'
        url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
        maxZoom={19}
      />
      {userPos && (
        <>
          <Marker position={[userPos.lat, userPos.lng] as any} icon={createUserIcon()}>
            <Popup>
              You are here
            </Popup>
          </Marker>
          <Circle center={[userPos.lat, userPos.lng] as any} radius={30} pathOptions={{ color: '#2563eb', fillColor: '#60a5fa', fillOpacity: 0.18 }} />
        </>
      )}
      {(Object.entries(attractions) as [Category, Attraction[]][]).map(
        ([category, places]) =>
          activeCategories[category] &&
          places.map((place) => (
            <Marker
              key={place.name}
              position={[place.lat, place.lng] as any}
              icon={createCustomIcon(category)}
            >
              <Popup>
                <strong>{place.name}</strong>
                <br />
                <em>{place.description}</em>
                <br />
                <span style={{ fontSize: '12px', color: '#666' }}>
                  {category.toUpperCase()}
                </span>
              </Popup>
            </Marker>
          )),
      )}
      </MapContainer>

      <div style={{ position: 'absolute', top: 12, right: 12, zIndex: 1000, display: 'flex', gap: 8 }}>
        <button
          onClick={() => {
            if (!userPos || !mapRef.current) return alert('No location available');
            try {
              mapRef.current.setView([userPos.lat, userPos.lng]);
              firstCenteredRef.current = true;
            } catch (e) { /* ignore */ }
          }}
          title='Center on my location'
          style={{ padding: '8px 10px', borderRadius: 8, background: 'white', border: '1px solid #e5e7eb', cursor: 'pointer' }}
        >
          Center
        </button>
        <button
          onClick={() => setAutoCenter(s => !s)}
          title='Toggle auto-center on location updates'
          style={{ padding: '8px 10px', borderRadius: 8, background: autoCenter ? '#2563eb' : 'white', color: autoCenter ? 'white' : 'black', border: '1px solid #e5e7eb', cursor: 'pointer' }}
        >
          {autoCenter ? 'Auto: On' : 'Auto: Off'}
        </button>
      </div>
    </div>
  );
};
