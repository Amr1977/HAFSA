import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface LocationPickerProps {
  latitude: number | null;
  longitude: number | null;
  onChange: (lat: number, lng: number) => void;
}

export default function LocationPicker({ latitude, longitude, onChange }: LocationPickerProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (!mapRef.current || mapInstance.current) return;
    const defaultLat = latitude || 30.0444;
    const defaultLng = longitude || 31.2357;
    const map = L.map(mapRef.current).setView([defaultLat, defaultLng], 10);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap',
    }).addTo(map);

    const marker = L.marker([defaultLat, defaultLng], { draggable: true }).addTo(map);
    marker.on('dragend', () => {
      const pos = marker.getLatLng();
      onChange(pos.lat, pos.lng);
    });
    map.on('click', (e: L.LeafletMouseEvent) => {
      marker.setLatLng(e.latlng);
      onChange(e.latlng.lat, e.latlng.lng);
    });

    markerRef.current = marker;
    mapInstance.current = map;
    return () => { map.remove(); mapInstance.current = null; };
  }, []);

  const handleSearch = async () => {
    if (!search.trim()) return;
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(search)}`);
      const data = await res.json();
      if (data?.[0]) {
        const { lat, lon } = data[0];
        const latNum = parseFloat(lat);
        const lngNum = parseFloat(lon);
        mapInstance.current?.setView([latNum, lngNum], 13);
        markerRef.current?.setLatLng([latNum, lngNum]);
        onChange(latNum, lngNum);
      }
    } catch {}
  };

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <input value={search} onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          placeholder="ابحث عن عنوان..."
          className="flex-1 border border-[#E5E7EB] dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-[#374151] dark:text-gray-200"
        />
        <button onClick={handleSearch}
          className="px-4 py-2 bg-[#1B4332] dark:bg-[#DAA520] text-white dark:text-[#1B4332] rounded-lg text-sm font-medium hover:bg-[#2D6A4F] dark:hover:bg-[#E6C84A] transition-colors"
        >بحث</button>
      </div>
      <div ref={mapRef} className="w-full h-60 rounded-xl border border-[#E5E7EB] dark:border-gray-600" />
      {latitude && longitude && (
        <p className="text-xs text-[#6B7280] dark:text-gray-400">{latitude.toFixed(4)}, {longitude.toFixed(4)}</p>
      )}
    </div>
  );
}
