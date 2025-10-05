"use client";

import React from 'react';
import Image from 'next/image';
import type { LatLng } from 'leaflet';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { LocateFixed, Search } from 'lucide-react';

export default function MapView({ setMarkerPosition }: { setMarkerPosition: (pos: LatLng | null) => void }) {

  const handleUseMyLocation = () => {
    // Mock location for demo
    // @ts-ignore
    setMarkerPosition({ lat: 40.7128, lng: -74.0060 });
  };

  return (
    <div className="relative w-full h-full">
        <Image 
            src="https://picsum.photos/seed/map/1200/900"
            alt="Map placeholder"
            fill
            className="object-cover rounded-2xl"
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
                        autoComplete="off"
                    />
                </div>
                
                <Button onClick={handleUseMyLocation} className="w-full bg-accent text-accent-foreground hover:bg-accent/90">
                    <LocateFixed className="mr-2 h-4 w-4" />
                    Use My Location
                </Button>
            </CardContent>
        </Card>
      </div>
    </div>
  );
}
