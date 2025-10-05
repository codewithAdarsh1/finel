"use client";

import React, { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from 'react-leaflet';
import L, { type LatLng } from 'leaflet';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search, X, Loader2, LocateFixed } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

// Fix for leaflet's default icon path in webpack environments
// @ts-ignore
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: markerIcon.src,
  iconRetinaUrl: markerIcon2x.src,
  shadowUrl: markerShadow.src,
});

const ZOOM = { initial: 7, min: 3, max: 19 };

function ClickableMap({ setMarker }: { setMarker: (latlng: LatLng) => void }) {
  useMapEvents({
    click(e) {
      setMarker(e.latlng);
    },
  });
  return null;
}

function FlyToMarker({ position }: { position: LatLng | null }) {
  const map = useMap();
  useEffect(() => {
    if (position) {
      const zoom = Math.max(ZOOM.min, Math.min(map.getZoom(), ZOOM.max));
      map.flyTo([position.lat, position.lng], zoom, { duration: 1.2 });
    }
  }, [position, map]);
  return null;
}

type PlaceSuggestion = {
    place_id: number;
    display_name: string;
    lat: string;
    lon: string;
}

const MapViewComponent = React.memo(function MapViewComponent({ markerPosition, setMarkerPosition, query, setQuery }: { markerPosition: LatLng | null, setMarkerPosition: (pos: LatLng | null) => void, query: string, setQuery: (q: string) => void }) {
    return (
        <MapContainer
            center={[27, 85]}
            zoom={ZOOM.initial}
            minZoom={ZOOM.min}
            maxZoom={ZOOM.max}
            className="w-full h-full"
            scrollWheelZoom={true}
        >
            <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            maxZoom={ZOOM.max}
            />
            <ClickableMap setMarker={(latlng) => {
                setMarkerPosition(latlng);
                const q = query.trim();
                if (q !== "Your Location" && q !== "") {
                    setQuery("");
                }
            }} />
            {markerPosition && (
            <>
                <Marker position={markerPosition} />
                <FlyToMarker position={markerPosition} />
            </>
            )}
        </MapContainer>
    );
});
MapViewComponent.displayName = 'MapViewComponent';

export default function MapView({ markerPosition, setMarkerPosition }: { markerPosition: LatLng | null, setMarkerPosition: (pos: LatLng | null) => void }) {
  const { toast } = useToast();
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<PlaceSuggestion[]>([]);
  const [selectedPlace, setSelectedPlace] = useState<PlaceSuggestion | null>(null);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [loadingSuggest, setLoadingSuggest] = useState(false);
  const [loadingSearch, setLoadingSearch] = useState(false);

  useEffect(() => {
    const q = query.trim();
    if (q.length < 2) {
      setSuggestions([]);
      setActiveIndex(-1);
      return;
    }

    const controller = new AbortController();
    const timer = setTimeout(async () => {
      try {
        setLoadingSuggest(true);
        const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q)}&limit=5&addressdetails=1`, { signal: controller.signal });
        const data = await response.json();
        setSuggestions(data);
        setActiveIndex(data.length ? 0 : -1);
      } catch (err: any) {
        if (err.name !== "AbortError") console.error(err);
      } finally {
        setLoadingSuggest(false);
      }
    }, 300);

    return () => {
      controller.abort();
      clearTimeout(timer);
    };
  }, [query]);

  const handleSelect = (place: PlaceSuggestion) => {
    setSelectedPlace(place);
    setQuery(place.display_name);
    setSuggestions([]);
    setActiveIndex(-1);
    
    const lat = parseFloat(place.lat);
    const lng = parseFloat(place.lon);
    setMarkerPosition(new LatLng(lat, lng));
  };

  const handleSearch = async () => {
    try {
        setLoadingSearch(true);
        let place = selectedPlace || (suggestions.length > 0 ? suggestions[0] : null);
        if (!place && query.trim()) {
            const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query.trim())}&limit=1&addressdetails=1`);
            const data = await res.json();
            if (data?.length) {
                place = data[0];
            }
        }

        if (!place) {
            toast({ variant: 'destructive', title: "Not Found", description: "No results found for your query." });
            return;
        }

        const lat = parseFloat(place.lat);
        const lng = parseFloat(place.lon);
        setMarkerPosition(new LatLng(lat, lng));
        setSelectedPlace(place);
        setQuery(place.display_name || query);
        setSuggestions([]);
        setActiveIndex(-1);
    } catch (e) {
        console.error(e);
        toast({ variant: 'destructive', title: "Search Error", description: "An error occurred while searching." });
    } finally {
        setLoadingSearch(false);
    }
  };


  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !suggestions.length && query.trim()) {
        e.preventDefault();
        handleSearch();
        return;
    }

    if (!suggestions.length) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => (i + 1) % suggestions.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => (i - 1 + suggestions.length) % suggestions.length);
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (activeIndex >= 0) {
        handleSelect(suggestions[activeIndex]);
      } else {
        handleSearch();
      }
    } else if (e.key === "Escape") {
      setSuggestions([]);
      setActiveIndex(-1);
    }
  };

  const handleUseMyLocation = () => {
    if (!("geolocation" in navigator)) {
      toast({ variant: 'destructive', title: "Geolocation not supported", description: "Your browser does not support geolocation." });
      return;
    }

    setLoadingSearch(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        setMarkerPosition(new LatLng(latitude, longitude));
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`);
          const data = await res.json();
          if (data?.display_name) setQuery(data.display_name);
          else setQuery("Your Location");
        } catch {
          setQuery("Your Location");
        } finally {
          setLoadingSearch(false);
        }
      },
      (err) => {
        console.error(err);
        setLoadingSearch(false);
        toast({ variant: 'destructive', title: "Location Error", description: "Unable to get your location. Please check your browser permissions." });
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  return (
    <div className="relative w-full h-full">
      <MapViewComponent markerPosition={markerPosition} setMarkerPosition={setMarkerPosition} query={query} setQuery={setQuery} />
      
      <div className="absolute top-4 right-4 z-[1000] w-[calc(100%-2rem)] sm:w-96">
        <Card>
            <CardContent className="p-3 space-y-2">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input
                        type="text"
                        value={query}
                        onChange={(e) => { setQuery(e.target.value); setSelectedPlace(null); }}
                        onKeyDown={handleKeyDown}
                        onBlur={() => setTimeout(() => setSuggestions([]), 200)}
                        placeholder="Search places..."
                        className="pl-10"
                        autoComplete="off"
                    />
                    {query && (
                        <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => { setQuery(""); setSelectedPlace(null); setSuggestions([]); setActiveIndex(-1); }}
                        className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
                        aria-label="Clear search"
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    )}
                    {suggestions.length > 0 && (
                        <Card className="absolute top-full mt-2 w-full z-10 shadow-lg">
                            <ScrollArea className="h-full max-h-64">
                                <ul className="p-1">
                                {suggestions.map((place, i) => (
                                    <li key={place.place_id}>
                                        <Button
                                            variant="ghost"
                                            className={cn("w-full justify-start text-left h-auto p-2", i === activeIndex && "bg-accent text-accent-foreground")}
                                            onMouseDown={(e) => { e.preventDefault(); handleSelect(place); }}
                                            onMouseEnter={() => setActiveIndex(i)}
                                        >
                                            {place.display_name}
                                        </Button>
                                    </li>
                                ))}
                                {loadingSuggest && (
                                    <li className="px-3 py-2 text-sm text-muted-foreground flex items-center gap-2">
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        Loading...
                                    </li>
                                )}
                                </ul>
                            </ScrollArea>
                        </Card>
                    )}
                </div>
                
                <Button onClick={handleUseMyLocation} disabled={loadingSearch} className="w-full bg-accent text-accent-foreground hover:bg-accent/90">
                    {loadingSearch ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Locating...
                        </>
                    ) : (
                        <>
                            <LocateFixed className="mr-2 h-4 w-4" />
                            Use My Location
                        </>
                    )}
                </Button>
            </CardContent>
        </Card>
      </div>

      {markerPosition && (
        <div className="absolute left-4 bottom-4 z-[1000]">
            <Card className="text-xs">
                <CardContent className="p-2">
                    <div><span className="font-semibold">Lat:</span> {markerPosition.lat.toFixed(6)}</div>
                    <div><span className="font-semibold">Lng:</span> {markerPosition.lng.toFixed(6)}</div>
                </CardContent>
            </Card>
        </div>
      )}
    </div>
  );
}
