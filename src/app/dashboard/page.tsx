"use client";

import React, { useState } from "react";
import type { LatLng } from "leaflet";
import AirQualityReport from "@/components/map/air-quality-report";
import MapView from '@/components/map/map-view';

export default function DashboardPage() {
  const [markerPosition, setMarkerPosition] = useState<LatLng | null>(null);
  const [locationName, setLocationName] = useState<string | null>(null);

  return (
    <main className="w-full h-screen bg-background text-foreground overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-[35%_65%] h-full gap-0">
            {/* Left Section – Air Quality Report */}
            <section className="flex flex-col justify-center items-center bg-card h-full w-full border-r border-border shadow-sm p-6 overflow-y-auto">
              <div className="w-full max-w-md">
                <AirQualityReport position={markerPosition} locationName={locationName} />
              </div>
            </section>

            {/* Right Section – Map */}
            <section className="relative h-[50vh] lg:h-full w-full p-0">
              <MapView 
                markerPosition={markerPosition}
                setMarkerPosition={setMarkerPosition} 
                setLocationName={setLocationName}
              />
              <div className="absolute bottom-4 left-4 bg-card/90 backdrop-blur-md rounded-xl px-4 py-2 text-sm shadow">
                Use the search bar or click on the map to select a location
              </div>
            </section>
        </div>
    </main>
  );
}
