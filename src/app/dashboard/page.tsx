"use client";

import React, { useState } from "react";
import type { LatLng } from "leaflet";
import AirQualityReport from "@/components/map/air-quality-report";
import dynamic from 'next/dynamic';

const MapView = dynamic(() => import('@/components/map/map-view'), {
  ssr: false,
  loading: () => <div className="w-full h-full bg-muted animate-pulse" />,
});


export default function DashboardPage() {
  const [markerPosition, setMarkerPosition] = useState<LatLng | null>(null);
  const [locationName, setLocationName] = useState<string | null>(null);

  return (
    <main className="w-full h-screen bg-gradient-to-br from-[#f9fafb] to-[#eef1f4] text-gray-900 overflow-hidden">
      <div className="grid grid-cols-1 lg:grid-cols-[35%_65%] h-full gap-0">

        {/* Left Section – Air Quality Report */}
        <section className="flex flex-col bg-white h-full w-full border-r border-gray-200 shadow-sm px-6 py-4 overflow-y-auto scroll-smooth">
          <div className="w-full max-w-md mx-auto mt-2 mb-6">
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
        </section>

      </div>
    </main>
  );
}
