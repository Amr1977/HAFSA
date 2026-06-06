import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface ServiceMapProps {
  services: Array<{
    id: string;
    title: string;
    latitude?: number | null;
    longitude?: number | null;
  }>;
  center?: [number, number];
  zoom?: number;
  onMarkerClick?: (id: string) => void;
}

export default function ServiceMap({ services, center = [30.0444, 31.2357], zoom = 10, onMarkerClick }: ServiceMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!mapRef.current || mapInstance.current) return;
    const map = L.map(mapRef.current).setView(center, zoom);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap',
    }).addTo(map);
    mapInstance.current = map;
    return () => { map.remove(); mapInstance.current = null; };
  }, []);

  useEffect(() => {
    if (!mapInstance.current) return;
    const map = mapInstance.current;
    map.eachLayer((layer) => {
      if (layer instanceof L.Marker) map.removeLayer(layer);
    });

    const markers: L.Marker[] = [];
    services.forEach((s) => {
      if (s.latitude && s.longitude) {
        const marker = L.marker([s.latitude, s.longitude])
          .addTo(map)
          .bindPopup(s.title);
        if (onMarkerClick) {
          marker.on('click', () => onMarkerClick(s.id));
        }
        markers.push(marker);
      }
    });

    if (markers.length > 0) {
      const group = L.featureGroup(markers);
      map.fitBounds(group.getBounds().pad(0.1));
    }
  }, [services, onMarkerClick]);

  return <div ref={mapRef} className="w-full h-full rounded-xl" />;
}
