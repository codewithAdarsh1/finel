"use client";

import React, { useState, useCallback, useMemo } from 'react';
import type { LatLng } from 'leaflet';
import L from 'leaflet';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { LocateFixed, Search, XIcon, Loader2 } from 'lucide-react';
import { OpenStreetMapProvider } from 'leaflet-geosearch';
import Image from 'next/image';


interface MapViewProps {
  markerPosition: LatLng | null;
  setMarkerPosition: (pos: LatLng) => void;
  setLocationName: (name: string) => void;
}

export default function MapView({ markerPosition, setMarkerPosition, setLocationName }: MapViewProps) {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLocating, setIsLocating] = useState(false);

  const provider = useMemo(() => new OpenStreetMapProvider({
    params: {
        'accept-language': 'en',
        countrycodes: '',
        addressdetails: 1,
    }
  }), []);

  const reverseGeocode = useCallback(async (latlng: LatLng) => {
    setIsLoading(true);
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
    } finally {
      setIsLoading(false);
    }
  }, [setLocationName, provider]);


  const handleUseMyLocation = () => {
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const latlng = new L.LatLng(latitude, longitude);
        setMarkerPosition(latlng);
        reverseGeocode(latlng);
        setIsLocating(false);
      },
      (error) => {
        console.error('Geolocation error:', error);
        alert('Could not get your location.');
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
      const results = await provider.search({ query });
      setSuggestions(results);
      setIsLoading(false);
    };

    const debounce = setTimeout(search, 500);
    return () => clearTimeout(debounce);
  }, [query, provider]);

  const onSuggestionClick = (place: any) => {
    setQuery('');
    setSuggestions([]);
    const latlng = new L.LatLng(place.y, place.x);
    setMarkerPosition(latlng);
    setLocationName(place.label);
  };

  return (
    <div className="relative w-full h-full rounded-2xl overflow-hidden">
      <Image 
        src="https://picsum.photos/seed/map/1200/800" 
        alt="Map placeholder" 
        fill
        className="brightness-75 object-cover"
        data-ai-hint="world map"
      />
      
      <div className="absolute top-4 right-4 z-[1000] w-[calc(100%-2rem)] sm:w-96">
        <Card>
          <CardContent className="p-3 space-y-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search places..."
                className="pl-10"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                autoComplete="off"
              />
              {query && (
                <Button variant="ghost" size="icon" className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7" onClick={() => { setQuery(''); setSuggestions([]); }}>
                  <XIcon className="h-4 w-4" />
                </Button>
              )}
            </div>
            
            {suggestions.length > 0 && (
                <Card className="max-h-60 overflow-y-auto">
                    <CardContent className="p-2">
                        {isLoading ? (
                            <div className="flex items-center justify-center p-2">
                                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                            </div>
                        ) : (
                            suggestions.map((place, i) => (
                                <Button
                                    key={i}
                                    variant="ghost"
                                    className="w-full justify-start text-left h-auto"
                                    onClick={() => onSuggestionClick(place)}
                                >
                                    {place.label}
                                </Button>
                            ))
                        )}
                    </CardContent>
                </Card>
            )}
            
            <Button onClick={handleUseMyLocation} className="w-full bg-accent text-accent-foreground hover:bg-accent/90" disabled={isLocating}>
              {isLocating ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <LocateFixed className="mr-2 h-4 w-4" />
              )}
              Use My Location
            </Button>
          </CardContent>
        </Card>
      </div>
      {!markerPosition && <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur-md rounded-xl px-4 py-2 text-sm shadow-lg animate-pulse">
        🌍 Use the map or search to select a location
      </div>}
    </div>
  );
}
