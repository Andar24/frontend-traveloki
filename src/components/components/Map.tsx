import { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import type { Category, Attraction, Attractions } from '../types';
import { CATEGORY_COLORS, CATEGORY_EMOJIS } from '../constants/attractions';
import 'leaflet/dist/leaflet.css';

interface MapProps {
  attractions: Attractions;
  activeCategories: Record<Category, boolean>;
  searchResult: Attraction | null;
}

export const Map = ({ attractions, activeCategories, searchResult }: MapProps) => {
  const mapRef = useRef<any>(null);

  useEffect(() => {
    if (searchResult && mapRef.current) {
      mapRef.current.setView([searchResult.lat, searchResult.lng], 15);
    }
  }, [searchResult]);

  const createCustomIcon = (category: Category) => {
    return L.divIcon({
      html: `<div style="background-color: ${CATEGORY_COLORS[category]}; width: 30px; height: 30px; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);">
        ${CATEGORY_EMOJIS[category]}
      </div>`,
      iconSize: [30, 30],
      className: 'custom-div-icon',
    });
  };

  return (
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
  );
};
