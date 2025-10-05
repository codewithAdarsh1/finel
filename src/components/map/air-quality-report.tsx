"use client";

import React, { useEffect, useState } from 'react';
import type { LatLng } from 'leaflet';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Leaf, Shield, MapPin, Smile, Frown, Meh, Angry, Annoyed } from 'lucide-react';

type AirQualityData = {
  list: {
    main: { aqi: number };
    components: {
      co: number;
      no: number;
      no2: number;
      o3: number;
      so2: number;
      pm2_5: number;
      pm10: number;
      nh3: number;
    };
  }[];
};

type InterpretedData = {
  aqi: number;
  level: string;
  description: string;
  measures: string;
  components: AirQualityData['list'][0]['components'];
  icon: React.ReactNode;
  colorClass: string;
};

const aqiInfo: { [key: number]: Omit<InterpretedData, 'aqi' | 'components'> } = {
  1: { level: "Good", description: "The air is fresh and safe to breathe.", measures: "Great day for outdoor activities! 🌞", icon: <Smile />, colorClass: "text-green-500" },
  2: { level: "Fair", description: "Air quality is acceptable.", measures: "Sensitive individuals may experience minor respiratory symptoms. 🌤️", icon: <Meh />, colorClass: "text-yellow-500" },
  3: { level: "Moderate", description: "Air quality may affect sensitive groups.", measures: "Children, elderly, or people with respiratory issues should limit heavy outdoor exertion. 🌫️", icon: <Frown />, colorClass: "text-orange-500" },
  4: { level: "Poor", description: "Pollution may cause health effects.", measures: "Everyone may begin to experience health effects; sensitive groups may experience more serious health effects. 😷", icon: <Angry />, colorClass: "text-red-500" },
  5: { level: "Very Poor", description: "Health alert: everyone may experience more serious health effects.", measures: "Avoid all outdoor exertion. Remain indoors and keep activity levels low. ☠️", icon: <Annoyed />, colorClass: "text-purple-700" }
};

const interpretAirQuality = (data: AirQualityData): InterpretedData | null => {
  if (!data || !data.list?.length) return null;
  const { aqi } = data.list[0].main;
  const { components } = data.list[0];
  const info = aqiInfo[aqi];
  return { aqi, ...info, components };
};

const PollutantRow = ({ name, value, unit }: { name: string, value: number, unit: string }) => (
    <TableRow>
        <TableCell className="font-medium">{name}</TableCell>
        <TableCell className="text-right">{value.toFixed(2)} {unit}</TableCell>
    </TableRow>
)

export default function AirQualityReport({ position }: { position: LatLng | null }) {
  const [airData, setAirData] = useState<AirQualityData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!position) {
      setAirData(null);
      setError(null);
      return;
    }

    const fetchAirQualityData = async () => {
      setLoading(true);
      setError(null);
      const apiKey = "b6dece846bbb74f864220bc44a524c54";
      const url = `https://api.openweathermap.org/data/2.5/air_pollution?lat=${position.lat}&lon=${position.lng}&appid=${apiKey}`;
      try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
        setAirData(data);
      } catch (err: any) {
        console.error("Error fetching air quality data:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAirQualityData();
  }, [position]);

  const result = airData ? interpretAirQuality(airData) : null;

  if (loading) {
    return (
        <Card>
            <CardHeader>
                <Skeleton className="h-8 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="flex items-center justify-center flex-col gap-4 text-center">
                    <Skeleton className="h-16 w-16 rounded-full" />
                    <Skeleton className="h-6 w-1/4" />
                    <Skeleton className="h-4 w-3/4" />
                </div>
                <Skeleton className="h-32 w-full" />
                <Skeleton className="h-48 w-full" />
            </CardContent>
        </Card>
    )
  }

  if (!position) {
    return (
        <Card className="h-full flex flex-col justify-center">
            <CardHeader className="text-center">
                <div className="mx-auto bg-primary/20 text-primary p-3 rounded-full w-fit mb-4">
                    <Leaf className="w-10 h-10" />
                </div>
                <CardTitle className="font-headline text-3xl">BreatheEasy</CardTitle>
                <CardDescription>Your personal air quality assistant</CardDescription>
            </CardHeader>
            <CardContent className="text-center">
                <div className="flex items-center justify-center text-muted-foreground">
                    <MapPin className="w-5 h-5 mr-2" />
                    <p>Select a location on the map to get started.</p>
                </div>
            </CardContent>
        </Card>
    )
  }
  
  if (error) {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="font-headline">Error</CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-destructive">⚠️ Could not fetch air quality data: {error}</p>
            </CardContent>
        </Card>
    )
  }
  
  if (!result) {
    return null;
  }

  return (
    <Card>
        <CardHeader>
            <CardTitle className="font-headline text-2xl">Air Quality Report</CardTitle>
            <CardDescription>Location: {position.lat.toFixed(4)}, {position.lng.toFixed(4)}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
            <div className={`flex items-center justify-center flex-col gap-2 text-center p-6 rounded-lg bg-card border`}>
                <div className={`${result.colorClass}`}>{React.cloneElement(result.icon as React.ReactElement, { size: 64, strokeWidth: 1.5 })}</div>
                <h3 className={`font-headline text-3xl font-bold ${result.colorClass}`}>
                    {result.level} (AQI: {result.aqi})
                </h3>
                <p className="text-muted-foreground">{result.description}</p>
            </div>
            
            <Card className="bg-secondary/50">
                <CardHeader className="flex-row items-center gap-4 space-y-0">
                    <Shield className="w-6 h-6 text-accent" />
                    <CardTitle className="font-headline text-xl">Recommended Actions</CardTitle>
                </CardHeader>
                <CardContent>
                    <p>{result.measures}</p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="font-headline text-xl">Pollutant Levels</CardTitle>
                    <CardDescription>μg/m³ (micrograms per cubic meter)</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableBody>
                            {Object.entries(result.components).map(([key, value]) => (
                                <PollutantRow key={key} name={key.replace(/_5|co/g, m => ({'_5': '.5', 'co':'CO'})[m] || m).toUpperCase()} value={value} unit="μg/m³" />
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

        </CardContent>
    </Card>
  );
}
