"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import ScrollInfo from '@/components/landing/ScrollInfo';

export default function LandingPage() {
    const [showStory, setShowStory] = useState(false);

    return (
        <>
            <nav className="absolute top-0 left-0 w-full p-4 z-10 flex justify-between items-center">
                <h1 className="text-2xl font-bold font-headline">BreatheEasy</h1>
                <div>
                    <Link href="/dashboard" className="px-4 py-2 rounded-md bg-accent text-accent-foreground hover:bg-accent/90 transition-colors">
                        Dashboard
                    </Link>
                </div>
            </nav>
            <div className="absolute bottom-10 left-10 z-10 max-w-lg">
                <h2 className="text-5xl font-bold font-headline leading-tight">Monitor Air & Soil Quality with Precision</h2>
                <p className="mt-4 text-lg text-white/80">
                    Get real-time environmental data at your fingertips. Make informed decisions for a healthier planet.
                </p>
                <Button onClick={() => setShowStory(true)} className="mt-6" variant="outline">
                    Learn about Terra
                </Button>
            </div>
            {showStory && <ScrollInfo story={showStory} setStory={setShowStory} />}
        </>
    );
}
