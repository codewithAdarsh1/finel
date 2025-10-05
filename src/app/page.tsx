"use client";
import React, { useState } from "react";
import Link from 'next/link';
import Scene from "@/components/landing/Scene";

export default function Home() {
  const [story, setStory] = useState(false);

  return (
    <main className="w-full h-screen bg-black text-white overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full z-0">
        <Scene story={story} />
      </div>
      <nav className="absolute top-0 left-0 w-full p-4 z-10 flex justify-between items-center">
        <h1 className="text-2xl font-bold font-headline">BreatheEasy</h1>
        <div>
          <Link href="/dashboard" className="px-4 py-2 rounded-md bg-accent text-accent-foreground hover:bg-accent/90 transition-colors">
            Dashboard
          </Link>
          <button onClick={() => setStory(!story)} className="ml-4 px-4 py-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors">
            Toggle Story
          </button>
        </div>
      </nav>
      <div className="absolute bottom-10 left-10 z-10 max-w-lg">
        <h2 className="text-5xl font-bold font-headline leading-tight">Monitor Air & Soil Quality with Precision</h2>
        <p className="mt-4 text-lg text-white/80">
          Get real-time environmental data at your fingertips. Make informed decisions for a healthier planet.
        </p>
      </div>
    </main>
  );
}
