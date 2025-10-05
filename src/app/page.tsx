"use client";

import React, { useState } from "react";
import type { LatLng } from "leaflet";
import AirQualityReport from "@/components/map/air-quality-report";
import MapView from "@/components/map/map-view";

export default function Home() {
  const [markerPosition, setMarkerPosition] = useState<LatLng | null>(null);

  return (
    <main className="w-full h-screen bg-gradient-to-br from-[#f9fafb] to-[#eef1f4] text-gray-900 overflow-hidden">
      <div className="grid grid-cols-1 lg:grid-cols-2 h-full gap-0">

        {/* Left Section – Air Quality Report */}
        <section className="flex flex-col justify-center items-center bg-white h-full w-full border-r border-gray-200 shadow-sm p-6 overflow-y-auto">
          <div className="w-full max-w-md">
            <AirQualityReport position={markerPosition} />
          </div>
        </section>

        {/* Right Section – Map */}
        <section className="relative h-[50vh] lg:h-full w-full p-0">
          <MapView setMarkerPosition={setMarkerPosition} />
          <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-md rounded-xl px-4 py-2 text-sm shadow">
            🌍 Use the map to select a location
          </div>
        </section>

      </div>
    </main>
  );
}
