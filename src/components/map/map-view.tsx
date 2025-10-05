"use client";

import React, { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import L, { LatLng } from 'leaflet';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { LocateFixed, Search, XIcon, Loader2, Link as LinkIcon } from 'lucide-react';
import { OpenStreetMapProvider } from 'leaflet-geosearch';
import 'leaflet/dist/leaflet.css';

// Fix for default icon issues with webpack
import iconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png';
import iconUrl from 'leaflet/dist/images/marker-icon.png';
import shadowUrl from 'leaflet/dist/images/marker-shadow.png';

interface MapViewProps {
  markerPosition: LatLng | null;
  setMarkerPosition: (pos: LatLng) => void;
  setLocationName: (name: string) => void;
}

export default function MapView({ markerPosition, setMarkerPosition, setLocationName }: MapViewProps) {
  const mapRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLocating, setIsLocating] = useState(false);

  // Initialize Leaflet only on the client side
  useEffect(() => {
    (async () => {
      // Set up the default icon
      // @ts-ignore
      delete L.Icon.Default.prototype._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: iconRetinaUrl.src,
        iconUrl: iconUrl.src,
        shadowUrl: shadowUrl.src,
      });

      // Initialize map
      const map = L.map('map', {
        center: [20, 0],
        zoom: 3,
        zoomControl: false,
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(map);

      // Add zoom control to the bottom right
      L.control.zoom({ position: 'bottomright' }).addTo(map);
      
      map.on('click', (e) => {
        handleSetPosition(e.latlng);
      });

      mapRef.current = map;

    })();

    return () => {
      mapRef.current?.remove();
    };
  }, []);

  const provider = useMemo(() => new OpenStreetMapProvider({
    params: {
        'accept-language': 'en',
        countrycodes: '',
        addressdetails: 1,
    }
  }), []);

  const reverseGeocode = useCallback(async (latlng: LatLng) => {
    try {
      // @ts-ignore
      const results = await provider.search({ query: `${latlng.lat}, ${latlng.lng}` });
      if (results && results.length > 0) {
        setLocationName(results[0].label);
      } else {
        setLocationName(`Lat: ${latlng.lat.toFixed(4)}, Lng: ${latlng.lng.toFixed(4)}`);
      }
    } catch (error) {
      console.error("Reverse geocoding error:", error);
      setLocationName(`Lat: ${latlng.lat.toFixed(4)}, Lng: ${latlng.lng.toFixed(4)}`);
    }
  }, [setLocationName, provider]);

  const handleSetPosition = (latlng: LatLng, zoomLevel: number = 13) => {
      setMarkerPosition(latlng);
      reverseGeocode(latlng);
      if (mapRef.current) {
        mapRef.current.flyTo(latlng, zoomLevel);
        if (markerRef.current) {
          markerRef.current.setLatLng(latlng);
        } else {
          markerRef.current = L.marker(latlng).addTo(mapRef.current);
        }
      }
  };

  const handleUseMyLocation = () => {
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const latlng = new LatLng(latitude, longitude);
        handleSetPosition(latlng);
        setIsLocating(false);
      },
      (error) => {
        console.error('Geolocation error:', error);
        alert('Could not get your location. Please ensure location services are enabled in your browser and for this site.');
        setIsLocating(false);
      }
    );
  };
  
  React.useEffect(() => {
    if (query.length < 3) {
      setSuggestions([]);
      return;
    }

    const search = async () => {
      setIsLoading(true);
      // @ts-ignore
      const results = await provider.search({ query });
      setSuggestions(results);
      setIsLoading(false);
    };

    const debounce = setTimeout(search, 500);
    return () => clearTimeout(debounce);
  }, [query, provider]);

  const onSuggestionClick = (place: any) => {
    setQuery(place.label);
    setSuggestions([]);
    const latlng = new LatLng(place.y, place.x);
    handleSetPosition(latlng);
    setLocationName(place.label);
  };

  return (
    <div className="absolute inset-0 w-full h-full">
      <div id="map" className="w-full h-full" />
      
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 w-[calc(100%-2rem)] sm:w-96">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search any place in the world..."
              className="pl-10 h-12 text-md rounded-full shadow-lg"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              autoComplete="off"
            />
            {query && (
              <Button variant="ghost" size="icon" className="absolute right-12 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full" onClick={() => { setQuery(''); setSuggestions([]); }}>
                <XIcon className="h-5 w-5" />
              </Button>
            )}
             <Button 
                variant="ghost" 
                size="icon" 
                className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-background" 
                onClick={handleUseMyLocation}
                disabled={isLocating}
                title="Use My Location"
              >
              {isLocating ? <Loader2 className="h-5 w-5 animate-spin" /> : <LocateFixed className="h-5 w-5" />}
            </Button>
          </div>
          
          {suggestions.length > 0 && (
              <Card className="mt-2 max-h-60 overflow-y-auto shadow-lg z-[1001]">
                  <CardContent className="p-2">
                      {isLoading ? (
                          <div className="flex items-center justify-center p-4">
                              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                          </div>
                      ) : (
                          suggestions.map((place, i) => (
                              <Button
                                  key={i}
                                  variant="ghost"
                                  className="w-full justify-start text-left h-auto py-2 px-3"
                                  onClick={() => onSuggestionClick(place)}
                              >
                                  {place.label}
                              </Button>
                          ))
                      )}
                  </CardContent>
              </Card>
          )}
      </div>

       <div className="absolute bottom-4 right-4 z-[1000]">
         <Button variant="ghost" size="sm" asChild>
           <a href="/" className="flex items-center gap-2 text-foreground hover:text-primary bg-card/80 rounded-md p-2">
             <LinkIcon className="h-4 w-4" /> Go to Landing Page
           </a>
         </Button>
      </div>
    </div>
  );
}