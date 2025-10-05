"use client";

import React, { useState } from "react";
import type { LatLng } from "leaflet";
import AirQualityReport from "@/components/map/air-quality-report";
import MapView from '@/components/map/map-view';

export default function DashboardPage() {
  const [markerPosition, setMarkerPosition] = useState<LatLng | null>(null);
  const [locationName, setLocationName] = useState<string | null>(null);

  return (
    <main className="w-full min-h-screen bg-background text-foreground">
      <div className="relative h-screen w-full">
        {/* Background Map */}
        <MapView 
          markerPosition={markerPosition}
          setMarkerPosition={setMarkerPosition} 
          setLocationName={setLocationName}
        />
        
        {/* Centered Content */}
        <div className="absolute inset-0 flex justify-center items-start pt-20 md:pt-24 lg:pt-32">
          <div className="w-full max-w-lg mx-4">
            <AirQualityReport position={markerPosition} locationName={locationName} />
          </div>
        </div>
      </div>
    </main>
  );
}
