"use client";

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import type { LatLng } from 'leaflet';
import AirQualityReport from '@/components/map/air-quality-report';
import MapView from '@/components/map/map-view';

export default function Home() {
  const [markerPosition, setMarkerPosition] = useState<LatLng | null>(null);

  return (
    <main className="w-full h-screen bg-background overflow-hidden">
      <div className="grid grid-cols-1 xl:grid-cols-9 h-full">
        <div className="xl:col-span-4 h-full overflow-y-auto p-4 md:p-6">
          <AirQualityReport position={markerPosition} />
        </div>
        <div className="relative xl:col-span-5 h-[60vh] xl:h-full p-4 md:p-6 pt-0 xl:pt-6 xl:pl-0">
          <MapView setMarkerPosition={setMarkerPosition} />
        </div>
      </div>
    </main>
  );
}
