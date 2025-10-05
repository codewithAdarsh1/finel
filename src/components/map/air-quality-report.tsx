"use client";

import React, { useEffect, useState } from 'react';
import type { LatLng } from 'leaflet';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Leaf, Shield, MapPin, Smile, Frown, Meh, Angry, Annoyed, Wind, Mountain, BrainCircuit } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { soilAnalysis } from '@/ai/flows/soil-analysis-flow';
import type { SoilAnalysisInput, SoilAnalysisOutput } from '@/ai/schemas/soil-analysis-schemas';


// --- Air Quality Types ---
type AirQualityData = {
  list: {
    main: { aqi: number };
    components: {
      co: number; no: number; no2: number; o3: number; so2: number;
      pm2_5: number; pm10: number; nh3: number;
    };
  }[];
};

type InterpretedAirData = {
  aqi: number; level: string; description: string; measures: string;
  components: AirQualityData['list'][0]['components'];
  icon: React.ReactNode; colorClass: string;
};

// --- Soil Quality Types ---
type SoilGridsLayer = {
    name: string;
    depths: { values: { mean: number } }[];
    unit_measure: { name: string; label: string; unit: string; };
    units: string;
};

type SoilData = {
    property: string;
    name: string;
    mean: number;
    unit: string;
};

// --- Component Props ---
interface AirQualityReportProps {
  position: LatLng | null;
  locationName: string | null;
}

// --- Helper Data & Functions ---

const aqiInfo: { [key: number]: Omit<InterpretedAirData, 'aqi' | 'components'> } = {
  1: { level: "Good", description: "The air is fresh and safe to breathe.", measures: "Great day for outdoor activities! 🌞", icon: <Smile />, colorClass: "text-green-500" },
  2: { level: "Fair", description: "Air quality is acceptable.", measures: "Sensitive individuals may experience minor respiratory symptoms. 🌤️", icon: <Meh />, colorClass: "text-yellow-500" },
  3: { level: "Moderate", description: "Air quality may affect sensitive groups.", measures: "Children, elderly, or people with respiratory issues should limit heavy outdoor exertion. 🌫️", icon: <Frown />, colorClass: "text-orange-500" },
  4: { level: "Poor", description: "Pollution may cause health effects.", measures: "Everyone may begin to experience health effects; sensitive groups may experience more serious health effects. 😷", icon: <Angry />, colorClass: "text-red-500" },
  5: { level: "Very Poor", description: "Health alert: everyone may experience more serious health effects.", measures: "Avoid all outdoor exertion. Remain indoors and keep activity levels low. ☠️", icon: <Annoyed />, colorClass: "text-purple-700" }
};

const interpretAirQuality = (data: AirQualityData): InterpretedAirData | null => {
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
);

function formatSoilPropertyName(name: string): string {
    const names: { [key: string]: string } = {
        clay: "Clay", sand: "Sand", silt: "Silt", soc: "Organic Carbon",
        phh2o: "pH (H₂O)", nitrogen: "Nitrogen", bdod: "Bulk Density",
    };
    return names[name] || name;
}

// --- Main Component ---

export default function AirQualityReport({ position, locationName }: AirQualityReportProps) {
    const [reportType, setReportType] = useState<'air' | 'soil'>('air');

    // Air quality state
    const [airData, setAirData] = useState<AirQualityData | null>(null);
    const [airError, setAirError] = useState<string | null>(null);
    const [airLoading, setAirLoading] = useState(false);

    // Soil quality state
    const [soilData, setSoilData] = useState<SoilData[] | null>(null);
    const [soilError, setSoilError] = useState<string | null>(null);
    const [soilLoading, setSoilLoading] = useState(false);
    
    // AI Soil Analysis State
    const [aiAnalysis, setAiAnalysis] = useState<SoilAnalysisOutput | null>(null);
    const [aiLoading, setAiLoading] = useState(false);
    const [aiError, setAiError] = useState<string | null>(null);


    // Fetch Air Quality Data
    useEffect(() => {
        if (!position || reportType !== 'air') {
            setAirData(null);
            setAirError(null);
            return;
        }

        const fetchAirQualityData = async () => {
            setAirLoading(true);
            setAirError(null);
            const apiKey = "b6dece846bbb74f864220bc44a524c54";
            const url = `https://api.openweathermap.org/data/2.5/air_pollution?lat=${position.lat}&lon=${position.lng}&appid=${apiKey}`;
            try {
                const response = await fetch(url);
                if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
                const data = await response.json();
                setAirData(data);
            } catch (err: any) {
                setAirError(err.message);
            } finally {
                setAirLoading(false);
            }
        };

        fetchAirQualityData();
    }, [position, reportType]);

    // Fetch Soil Quality Data
    useEffect(() => {
        if (!position || reportType !== 'soil') {
            setSoilData(null);
            setSoilError(null);
            setAiAnalysis(null);
            setAiError(null);
            return;
        }

        const fetchAndAnalyzeSoil = async () => {
            setSoilLoading(true);
            setSoilError(null);
            setAiAnalysis(null);
            setAiError(null);
            
            const url = `https://rest.isric.org/soilgrids/v2.0/properties/query?lon=${position.lng}&lat=${position.lat}&property=clay&property=sand&property=silt&property=soc&property=phh2o&property=nitrogen&property=bdod&depth=0-5cm`;
            try {
                const response = await fetch(url);
                if (!response.ok) {
                    if (response.status === 404) throw new Error("No soil data available for this location.");
                    throw new Error(`Server returned error: ${response.status}`);
                }
                const data = await response.json();
                const layers = data?.properties?.layers as SoilGridsLayer[];
                if (!layers || !Array.isArray(layers)) throw new Error("Invalid data format from soil API.");

                const processed = layers.map((layer): SoilData | null => {
                    const value = layer?.depths?.[0]?.values?.mean;
                    if (value == null) return null;
                    let displayValue = value;
                    let displayUnit = layer?.unit_measure?.name || layer?.unit_measure?.label || layer?.unit_measure?.unit || layer?.units || "";
                    if (layer.name === "phh2o") {
                        displayValue = value / 10;
                        displayUnit = "pH";
                    } else if (layer.name === "soc") {
                        displayValue = value / 10; // g/kg
                        displayUnit = "g/kg";
                    } else if (layer.name === "bdod") {
                        displayValue = value / 100; // kg/dm³
                        displayUnit = "kg/dm³";
                    }
                    return {
                        property: formatSoilPropertyName(layer.name),
                        name: layer.name,
                        mean: displayValue,
                        unit: displayUnit,
                    };
                }).filter(Boolean) as SoilData[];
                
                setSoilData(processed);
                setSoilLoading(false); // Stop soil loading before starting AI analysis

                // Now, trigger AI analysis
                setAiLoading(true);
                const aiInput: SoilAnalysisInput = processed.reduce((acc, item) => {
                    if (item.name === 'phh2o') acc.ph = item.mean;
                    else if (item.name === 'soc') acc.soc = item.mean;
                    else acc[item.name as keyof Omit<SoilAnalysisInput, 'ph' | 'soc'>] = item.mean;
                    return acc;
                }, {} as SoilAnalysisInput);

                const analysisResult = await soilAnalysis(aiInput);
                setAiAnalysis(analysisResult);

            } catch (err: any) {
                if (soilLoading) setSoilError(err.message);
                else setAiError(err.message);
            } finally {
                setSoilLoading(false);
                setAiLoading(false);
            }
        };

        fetchAndAnalyzeSoil();
    }, [position, reportType]);

    const interpretedAirData = airData ? interpretAirQuality(airData) : null;
    const loading = airLoading || soilLoading;
    const error = airError || soilError;

    // --- RENDER LOGIC ---

    if (loading) {
        return (
            <Card>
                <CardHeader>
                    <Skeleton className="h-8 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                </CardHeader>
                <CardContent className="space-y-6">
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
                        <Wind className="w-10 h-10" />
                    </div>
                    <CardTitle className="font-headline text-3xl">BreatheEasy</CardTitle>
                    <CardDescription>Your personal environment assistant</CardDescription>
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

    const renderReport = () => {
        if (error) {
            return (
                <Card>
                    <CardHeader>
                        <CardTitle className="font-headline">Error</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-destructive">⚠️ Could not fetch data: {error}</p>
                    </CardContent>
                </Card>
            )
        }

        if (reportType === 'air' && interpretedAirData) {
            return (
                <>
                    <div className={`flex items-center justify-center flex-col gap-2 text-center p-6 rounded-lg bg-card border`}>
                        <div className={`${interpretedAirData.colorClass}`}>{React.cloneElement(interpretedAirData.icon as React.ReactElement, { size: 64, strokeWidth: 1.5 })}</div>
                        <h3 className={`font-headline text-3xl font-bold ${interpretedAirData.colorClass}`}>
                            {interpretedAirData.level} (AQI: {interpretedAirData.aqi})
                        </h3>
                        <p className="text-muted-foreground">{interpretedAirData.description}</p>
                    </div>
                    
                    <Card className="bg-secondary/50">
                        <CardHeader className="flex-row items-center gap-4 space-y-0">
                            <Shield className="w-6 h-6 text-accent" />
                            <CardTitle className="font-headline text-xl">Recommended Actions</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p>{interpretedAirData.measures}</p>
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
                                    {Object.entries(interpretedAirData.components).map(([key, value]) => (
                                        <PollutantRow key={key} name={key.replace(/_5|co/g, m => ({'_5': '.5', 'co':'CO'})[m] || m).toUpperCase()} value={value} unit="μg/m³" />
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </>
            )
        }

        if (reportType === 'soil' && soilData) {
            return (
                 <>
                    <Card>
                        <CardHeader>
                            <CardTitle className="font-headline text-xl">Soil Metrics (0-5cm)</CardTitle>
                            <CardDescription>Data from SoilGrids</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableBody>
                                    {soilData.map((item) => (
                                        <TableRow key={item.name}>
                                            <TableCell className="font-medium">{item.property}</TableCell>
                                            <TableCell className="text-right">{item.mean.toFixed(2)} {item.unit}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>

                    {aiLoading && (
                        <Card>
                            <CardHeader className="flex-row items-center gap-4 space-y-0">
                                <BrainCircuit className="w-6 h-6 text-accent animate-pulse" />
                                <CardTitle className="font-headline text-xl">AI Advisor Analyzing...</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <Skeleton className="h-4 w-3/4 mb-2" />
                                <Skeleton className="h-4 w-1/2" />
                            </CardContent>
                        </Card>
                    )}

                    {aiError && (
                         <Card>
                            <CardHeader>
                                <CardTitle className="font-headline">AI Error</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-destructive">⚠️ Could not get AI analysis: {aiError}</p>
                            </CardContent>
                        </Card>
                    )}

                    {aiAnalysis && (
                        <Card className="bg-primary/10 border-primary/50">
                            <CardHeader className="flex-row items-center gap-4 space-y-0">
                                <BrainCircuit className="w-6 h-6 text-primary" />
                                <CardTitle className="font-headline text-xl text-primary">AI Farming Advisor</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <h4 className="font-semibold mb-1">Soil Type</h4>
                                    <p className="text-sm">{aiAnalysis.soilType.type}: {aiAnalysis.soilType.description}</p>
                                </div>
                                <div>
                                    <h4 className="font-semibold mb-1">Suitable Crops</h4>
                                    <p className="text-sm">{aiAnalysis.cropSuggestions.join(', ')}</p>
                                </div>
                                <div>
                                    <h4 className="font-semibold mb-1">Soil Amendments</h4>
                                    <p className="text-sm">{aiAnalysis.amendmentSuggestions.join('. ')}.</p>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                 </>
            )
        }
        return null;
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="font-headline text-2xl flex justify-between items-center">
                    <span>
                        {reportType === 'air' ? 'Air Quality Report' : 'Soil Quality Report'}
                    </span>
                     <Select value={reportType} onValueChange={(value: 'air' | 'soil') => setReportType(value)}>
                        <SelectTrigger className="w-[140px] text-sm">
                            <SelectValue placeholder="Select report" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="air"><Wind className="w-4 h-4 mr-2 inline-block"/>Air Quality</SelectItem>
                            <SelectItem value="soil"><Mountain className="w-4 h-4 mr-2 inline-block"/>Soil Quality</SelectItem>
                        </SelectContent>
                    </Select>
                </CardTitle>
                <CardDescription>
                    {locationName ? locationName : `Location: ${position.lat.toFixed(4)}, ${position.lng.toFixed(4)}`}
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                {renderReport()}
            </CardContent>
        </Card>
    );
}
