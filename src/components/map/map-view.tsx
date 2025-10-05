"use client";

import React, { useState, useCallback, useMemo } from 'react';
import type { LatLng, LatLngTuple } from 'leaflet';
import L from 'leaflet';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { LocateFixed, Search, XIcon, Loader2, Link } from 'lucide-react';
import { OpenStreetMapProvider } from 'leaflet-geosearch';
import Image from 'next/image';

interface MapViewProps {
  markerPosition: LatLng | null;
  setMarkerPosition: (pos: LatLng) => void;
  setLocationName: (name: string) => void;
}

export default function MapView({ setMarkerPosition, setLocationName }: MapViewProps) {
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
    const latlng = new L.LatLng(place.y, place.x);
    setMarkerPosition(latlng);
    setLocationName(place.label);
  };

  return (
    <div className="absolute inset-0 w-full h-full">
      <Image 
        src="https://picsum.photos/seed/map/1920/1080" 
        alt="World map" 
        fill
        className="object-cover brightness-50"
        quality={90}
        priority
        data-ai-hint="world map"
      />
      
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
                className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full" 
                onClick={handleUseMyLocation}
                disabled={isLocating}
                title="Use My Location"
              >
              {isLocating ? <Loader2 className="h-5 w-5 animate-spin" /> : <LocateFixed className="h-5 w-5" />}
            </Button>
          </div>
          
          {suggestions.length > 0 && (
              <Card className="mt-2 max-h-60 overflow-y-auto shadow-lg">
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

       <div className="absolute bottom-4 right-4 z-10">
         <Button variant="ghost" size="sm" asChild>
           <a href="/" className="flex items-center gap-2 text-white/80 hover:text-white">
             <Link className="h-4 w-4" /> Go to Landing Page
           </a>
         </Button>
      </div>
    </div>
  );
}
