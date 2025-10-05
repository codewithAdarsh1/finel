"use client";

import React from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import BackBtn from "./BackBtn";

const impactCards = [
    { title: "Disaster Response", description: "Rapid fire hotspots, flood extents, and volcano monitoring guide responders." },
    { title: "Air Quality & Health", description: "Tracks smoke, dust, and CO to improve PM2.5 estimates and public alerts." },
    { title: "Climate Evidence", description: "Measures Earth’s energy imbalance and long‑term trends in snow, ice, vegetation, and fire." },
    { title: "Agriculture & Food Security", description: "NDVI/EVI flag drought stress and help forecast yields." },
    { title: "Water Resources & Drought", description: "Snow cover and land‑surface temperature improve runoff and drought monitoring." },
    { title: "Ocean Health & Fisheries", description: "Ocean color maps phytoplankton and harmful algal blooms." },
    { title: "Urban Planning & Heat", description: "ASTER thermal maps pinpoint urban heat islands for cooling strategies." },
    { title: "Hazards & Infrastructure", description: "Stereo/thermal imagery supports landslide risk, lava flow, and damage assessment." },
    { title: "Open Data & Policy", description: "Free global datasets empower researchers, support national reporting, and calibrate newer satellites." }
];

const whatItDoesItems = [
    { title: "Land", description: "Tracks vegetation health, drought, deforestation, urban growth, and wildfires (hotspot detection) with near‑daily global coverage (MODIS)." },
    { title: "Oceans", description: "Monitors sea surface temperature, ocean color, and phytoplankton growth (MODIS, VIIRS)." },
    { title: "Atmosphere", description: "Maps smoke, dust, and other aerosols (MISR), measures carbon monoxide to follow pollution and fire plumes (MOPITT), and characterizes clouds (MODIS/MISR)." },
    { title: "Energy Budget", description: "Measures how much solar energy Earth absorbs vs. reflects and how much heat it emits back to space—key for climate change trends (CERES)." },
    { title: "Heat & Topography", description: "Captures high‑resolution thermal and stereo images for volcanoes, urban heat, land surface temperature, and terrain models (ASTER)." }
]

const ScrollInfo = ({story, setStory}: {story: boolean, setStory: (story: boolean) => void}) => {
  return (
    <div className="absolute w-full h-screen overflow-hidden bg-black/50 backdrop-blur-xl z-[999]">
      <BackBtn story={story} setStory={setStory} />
      <ScrollArea className="h-full w-full text-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
          <header className="text-center mb-16">
            <h1 className="text-6xl md:text-8xl font-bold font-headline text-primary tracking-wider">TERRADATA</h1>
          </header>

          {/* Introduction Section */}
          <section className="grid md:grid-cols-2 gap-12 items-center mb-24">
            <div className="space-y-4">
              <h2 className="text-4xl font-headline text-primary">INTRODUCTION</h2>
              <p className="text-lg text-white/80 leading-relaxed">
                Terra (EOS AM‑1) is NASA’s flagship Earth‑observing satellite,
                launched in 1999. Flying in a sun‑synchronous polar orbit, it
                carries five key instruments—MODIS, ASTER, MISR, CERES, and
                MOPITT—to monitor Earth’s land, oceans, atmosphere, and energy
                budget. Its long, consistent data record underpins climate
                research, wildfire and air‑quality monitoring, and land‑use
                change studies. All data are open and free via NASA Earthdata.
              </p>
            </div>
            <div>
              <img
                src="https://images.unsplash.com/photo-1614726365902-773e79397509?q=80&w=2940&auto=format&fit=crop"
                alt="Terra Satellite in orbit"
                className="rounded-lg shadow-2xl aspect-video object-cover"
                data-ai-hint="satellite space"
              />
            </div>
          </section>
          
          {/* What It Does Section */}
          <section className="mb-24">
            <div className="text-center max-w-3xl mx-auto">
                <h2 className="text-4xl font-headline text-primary mb-4">WHAT IT DOES</h2>
                <p className="text-lg text-white/80 leading-relaxed">
                    NASA’s Terra satellite (EOS AM‑1) is an Earth‑observing workhorse
                    that takes daily, global snapshots to track how our planet is
                    changing. Here’s what it does:
                </p>
            </div>
            <div className="mt-12 space-y-8">
                {whatItDoesItems.map((item, index) => (
                    <div key={index} className="grid md:grid-cols-3 gap-6 items-center border border-white/10 p-6 rounded-lg transition-all hover:bg-white/5 hover:border-white/20">
                        <h3 className="text-3xl font-headline md:text-right text-primary/80">{item.title}</h3>
                        <p className="md:col-span-2 text-white/80">{item.description}</p>
                    </div>
                ))}
            </div>
          </section>

          {/* Impact Section */}
          <section>
            <div className="text-center max-w-3xl mx-auto">
                <h2 className="text-4xl font-headline text-primary mb-4">IMPACT ON HUMANITY</h2>
                <p className="text-lg text-white/80 leading-relaxed">
                    NASA’s Terra satellite has delivered over two decades of practical
                    benefits for people and the planet—here’s the impact at a glance:
                </p>
            </div>
            <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {impactCards.map((card, index) => (
                    <div key={index} className="group border border-white/10 rounded-lg p-6 transition-all duration-300 hover:bg-primary/90 hover:border-primary cursor-pointer">
                        <h3 className="text-2xl font-bold font-headline">{card.title}</h3>
                        <p className="mt-2 text-base text-white/70 group-hover:text-primary-foreground">
                            {card.description}
                        </p>
                    </div>
                ))}
            </div>
          </section>

        </div>
      </ScrollArea>
    </div>
  );
};

export default ScrollInfo;
