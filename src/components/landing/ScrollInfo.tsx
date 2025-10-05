"use client";

import React, { useEffect, useRef } from "react";
import gsap from "gsap";
import BackBtn from "./BackBtn";

const ScrollInfo = ({story, setStory}: {story: boolean, setStory: (story: boolean) => void}) => {
  const contentRef = useRef<HTMLDivElement>(null);
  const scrollY = useRef(0);
  const maxScroll = useRef(0);

  useEffect(() => {
    const contentEl = contentRef.current;
    if (!contentEl) return;

    // compute max scroll based on content height
    const updateMaxScroll = () => {
      const totalHeight = contentEl.scrollHeight;
      const windowHeight = window.innerHeight;
      maxScroll.current = Math.max(totalHeight - windowHeight, 0);
    };
    updateMaxScroll();
    window.addEventListener("resize", updateMaxScroll);

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();

      // increment scroll position
      scrollY.current += e.deltaY;
      // clamp
      scrollY.current = Math.max(
        0,
        Math.min(maxScroll.current, scrollY.current)
      );

      // animate container with gsap (smooth interpolation)
      gsap.to(contentEl, {
        y: -scrollY.current,
        ease: "power3.out",
        duration: 0.6,
      });
    };

    const items = gsap.utils.toArray(".effect"); // get all .effect divs
    items.forEach((el) => {
      const element = el as HTMLElement;
      element.addEventListener("mouseenter", () => {
        gsap.to(element, {
          scale: 1.05,
          backgroundColor: "hsl(var(--primary))",
          borderRadius: "50px",
          duration: 0.3,
          ease: "power3.out",
        });
      });

      element.addEventListener("mouseleave", () => {
        gsap.to(element, {
          scale: 1,
          backgroundColor: "rgba(0,0,0,0)",
          borderRadius: "50px",
          duration: 0.3,
          ease: "power3.out",
        });
      });
    });

    window.addEventListener("wheel", handleWheel, { passive: false });

    return () => {
      window.removeEventListener("wheel", handleWheel);
      window.removeEventListener("resize", updateMaxScroll);
    };
  }, []);

  return (
    <div className=" absolute w-full h-screen overflow-hidden bg-black/50 backdrop-blur-xl z-[999]">
      <BackBtn story={story} setStory={setStory} />
      {/* scrolling content wrapper */}
      <div ref={contentRef} className="absolute top-0 left-0 w-full text-white">
        <div className="h-full w-full p-10">
          <div className="flex justify-center items-center font-bold text-9xl text-primary">
            <h1>TERRADATA</h1>
          </div>

          {/* introduction */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mt-20 px-4 md:px-20 p-10 items-center">
            <div>
              <div className="mb-5 text-5xl">
                <h1 className="text-primary">INTRODUCTION</h1>
              </div>
              <p className="text-2xl leading-8">
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
                className="rounded-lg shadow-2xl"
                data-ai-hint="satellite space"
              />
            </div>
          </div>

          {/* what it does */}
          <div className=" mt-20 px-4 md:px-20 p-10 ">
            <h1 className="text-5xl pb-5 text-primary" >WHAT IT DOES</h1>
            <p className="text-2xl leading-8 md:w-[50%]">
              NASA’s Terra satellite (EOS AM‑1) is an Earth‑observing workhorse
              that takes daily, global snapshots to track how our planet is
              changing. Here’s what it does:
            </p>

            <div className="p-2 md:p-10 mt-10 md:mt-20">
              <div className="effect grid gap-10 grid-cols-1 md:grid-cols-2 py-10 items-center">
                <div className=" flex items-center md:ml-20 text-5xl">
                  <h1>LAND</h1>
                </div>
                <p className="md:w-[80%] ">
                  Tracks vegetation health, drought, deforestation, urban
                  growth, and wildfires (hotspot detection) with near‑daily
                  global coverage (MODIS).
                </p>
              </div>
              <div className=" effect grid grid-cols-1 md:grid-cols-2 gap-10 py-10 items-center">
                <div className="flex  items-center md:ml-20 text-5xl">
                  <h1>Oceans</h1>
                </div>
                <p className="md:w-[80%]">
                  Monitors sea surface temperature, ocean color, and
                  phytoplankton growth (MODIS, VIIRS).
                </p>
              </div>
              <div className=" effect grid grid-cols-1 md:grid-cols-2 gap-10 py-10 items-center">
                <div className="flex  items-center md:ml-20 text-5xl">
                  <h1>Atmosphere</h1>
                </div>
                <p className="md:w-[80%]">
                  Maps smoke, dust, and other aerosols (MISR), measures carbon
                  monoxide to follow pollution and fire plumes (MOPITT), and
                  characterizes clouds (MODIS/MISR).
                </p>
              </div>
              <div className=" effect grid grid-cols-1 md:grid-cols-2 gap-10 py-10 items-center">
                <div className="flex  items-center md:ml-20 text-5xl">
                  <h1>Energy Budget</h1>
                </div>
                <p className="md:w-[80%]">
                  Measures how much solar energy Earth absorbs vs. reflects and
                  how much heat it emits back to space—key for climate change
                  trends (CERES).
                </p>
              </div>
              <div className=" effect grid grid-cols-1 md:grid-cols-2 gap-10 py-10 items-center">
                <div className="flex  items-center md:ml-20 text-5xl">
                  <h1>Heat & Topography</h1>
                </div>
                <p className="md:w-[80%]">
                  Captures high‑resolution thermal and stereo images for
                  volcanoes, urban heat, land surface temperature, and terrain
                  models (ASTER).
                </p>
              </div>
            </div>
          </div>

          {/* impact on humanity */}
            <div className="mt-20 px-4 md:px-20 p-10">
                <h1 className="text-5xl pb-5 text-primary">IMPACT ON HUMANITY</h1>
                <p className="text-2xl leading-8 md:w-[50%]">
                    NASA’s Terra satellite has delivered over two decades of practical
                    benefits for people and the planet—here’s the impact at a glance:
                </p>

                <div className="mt-20 grid gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                    
                    {[
                        { title: "Disaster Response", description: "Rapid fire hotspots, flood extents, and volcano monitoring guide responders." },
                        { title: "Air Quality & Health", description: "Tracks smoke, dust, and CO to improve PM2.5 estimates and public alerts." },
                        { title: "Climate Evidence", description: "Measures Earth’s energy imbalance and long‑term trends in snow, ice, vegetation, and fire." },
                        { title: "Agriculture & Food Security", description: "NDVI/EVI flag drought stress and help forecast yields." },
                        { title: "Water Resources & Drought", description: "Snow cover and land‑surface temperature improve runoff and drought monitoring." },
                        { title: "Ocean Health & Fisheries", description: "Ocean color maps phytoplankton and harmful algal blooms." },
                        { title: "Urban Planning & Heat", description: "ASTER thermal maps pinpoint urban heat islands for cooling strategies." },
                        { title_hidden: "Hazards & Infrastructure", description: "Stereo/thermal imagery supports landslide risk, lava flow, and damage assessment." },
                        { title_hidden: "Open Data & Policy", description: "Free global datasets empower researchers, support national reporting, and calibrate newer satellites." }
                    ].map((card, index) => (
                         <div key={index} className="group border border-white/20 rounded-lg p-5 transition-all duration-300 hover:bg-primary/90 hover:border-primary cursor-pointer h-fit overflow-hidden">
                            <h2 className="text-3xl font-bold">{card.title}</h2>
                            <p className="mt-3 text-lg leading-6 text-white/80 group-hover:text-primary-foreground">
                                {card.description}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default ScrollInfo;
