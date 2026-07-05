'use client';

import { useEffect, useRef, useState } from 'react';

interface LocationPickerProps {
  onLocationChange: (lat: number, lng: number, address: string) => void;
  defaultLat?: number;
  defaultLng?: number;
  className?: string;
}

export default function LocationPicker({ onLocationChange, defaultLat = 51.505, defaultLng = -0.09, className = '' }: LocationPickerProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const leafletRef = useRef<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [address, setAddress] = useState('');
  const searchTimeoutRef = useRef<any>(null);

  useEffect(() => {
    let cancelled = false;

    const init = async () => {
      const L = (await import('leaflet')).default;
      await import('leaflet/dist/leaflet.css');
      leafletRef.current = L;

      if (cancelled || !mapRef.current) return;

      // Fix default marker icon paths
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      });

      const map = L.map(mapRef.current, {
        center: [defaultLat, defaultLng],
        zoom: 13,
        zoomControl: true,
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(map);

      const marker = L.marker([defaultLat, defaultLng], { draggable: true }).addTo(map);
      markerRef.current = marker;

      marker.on('dragend', () => {
        const pos = marker.getLatLng();
        reverseGeocode(pos.lat, pos.lng);
      });

      map.on('click', (e: any) => {
        marker.setLatLng(e.latlng);
        reverseGeocode(e.latlng.lat, e.latlng.lng);
      });

      mapInstanceRef.current = map;

      // Geocode the default position
      reverseGeocode(defaultLat, defaultLng);
    };

    init();

    return () => {
      cancelled = true;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  const reverseGeocode = async (lat: number, lng: number) => {
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`);
      if (res.ok) {
        const data = await res.json();
        const addr = data.display_name || `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
        setAddress(addr);
        onLocationChange(lat, lng, addr);
      }
    } catch {
      const addr = `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
      setAddress(addr);
      onLocationChange(lat, lng, addr);
    }
  };

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (!query.trim()) { setSuggestions([]); return; }

    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    searchTimeoutRef.current = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5`);
        if (res.ok) {
          const data = await res.json();
          setSuggestions(data);
        }
      } catch {
        setSuggestions([]);
      } finally {
        setIsSearching(false);
      }
    }, 400);
  };

  const selectSuggestion = (item: any) => {
    const lat = parseFloat(item.lat);
    const lng = parseFloat(item.lon);
    setSearchQuery(item.display_name);
    setSuggestions([]);

    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView([lat, lng], 15);
      if (markerRef.current) {
        markerRef.current.setLatLng([lat, lng]);
      }
    }

    setAddress(item.display_name);
    onLocationChange(lat, lng, item.display_name);
  };

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="relative">
        <div className="relative">
          <svg
            className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/30 pointer-events-none"
            viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            value={searchQuery}
            onChange={e => handleSearch(e.target.value)}
            placeholder="Search for a location..."
            className="w-full bg-white/5 border border-white/10 rounded-lg pl-8 pr-3 py-2 text-white text-sm placeholder-white/30 outline-none focus:border-white/20"
          />
          {isSearching && (
            <div className="absolute right-2.5 top-1/2 -translate-y-1/2">
              <div className="w-3.5 h-3.5 rounded-full border border-white/20 animate-spin" style={{ borderTopColor: 'white', borderWidth: '2px' }} />
            </div>
          )}
        </div>
        {suggestions.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-black border border-white/10 rounded-lg overflow-hidden z-50 shadow-xl">
            {suggestions.map((item, i) => (
              <button
                key={i}
                onClick={() => selectSuggestion(item)}
                className="w-full text-left px-3 py-2 text-white/80 text-xs hover:bg-white/10 transition-colors border-b border-white/5 last:border-b-0"
              >
                {item.display_name}
              </button>
            ))}
          </div>
        )}
      </div>
      <div ref={mapRef} className="w-full h-48 rounded-lg overflow-hidden border border-white/10" />
      {address && (
        <p className="text-white/40 text-[10px] leading-relaxed line-clamp-2">{address}</p>
      )}
    </div>
  );
}
