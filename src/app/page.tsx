"use client";
import React, { Suspense, useState } from "react";
import Scene from '@/components/landing/Scene';
import { Skeleton } from "@/components/ui/skeleton";
import LandingPage from "./landing-page";
import ScrollInfo from "@/components/landing/ScrollInfo";

export default function Home() {
  const [showStory, setShowStory] = useState(false);

  return (
    <main className="w-full h-screen bg-black text-white overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full z-0">
        <Suspense fallback={<Skeleton className="w-full h-full bg-black" />}>
          <Scene />
        </Suspense>
      </div>
      <LandingPage showStory={showStory} setShowStory={setShowStory} />
      {showStory && <ScrollInfo story={showStory} setStory={setShowStory} />}
    </main>
  );
}