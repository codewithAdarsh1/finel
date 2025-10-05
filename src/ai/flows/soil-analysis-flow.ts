'use server';
/**
 * @fileOverview An AI flow for analyzing soil data and providing farming recommendations.
 *
 * - soilAnalysis - A function that takes soil metrics and returns AI-driven advice.
 */

import { ai } from '@/ai/genkit';
import {
    SoilAnalysisInputSchema,
    SoilAnalysisOutputSchema,
    type SoilAnalysisInput,
    type SoilAnalysisOutput,
} from '@/ai/schemas/soil-analysis-schemas';


export async function soilAnalysis(input: SoilAnalysisInput): Promise<SoilAnalysisOutput> {
    return soilAnalysisFlow(input);
}


const soilAnalysisPrompt = ai.definePrompt({
    name: 'soilAnalysisPrompt',
    input: { schema: SoilAnalysisInputSchema },
    output: { schema: SoilAnalysisOutputSchema },
    prompt: `You are an expert agronomist and soil scientist. Based on the following soil data, provide a detailed analysis for a farmer.

Soil Data:
- Clay content: {{clay}} g/kg
- Sand content: {{sand}} g/kg
- Silt content: {{silt}} g/kg
- pH level: {{ph}}
- Soil Organic Carbon: {{soc}} g/kg
{{#if nitrogen}}- Nitrogen: {{nitrogen}} ppm{{/if}}
{{#if bdod}}- Bulk Density: {{bdod}} kg/dm³{{/if}}

Your tasks:
1.  **Classify the soil type**: Determine the soil texture (e.g., Loam, Clay, Sandy Loam) based on the clay, sand, and silt content. Provide a brief, easy-to-understand description of its properties (drainage, nutrient retention, etc.).
2.  **Suggest suitable crops**: Recommend a list of at least 3-5 crops that would thrive in this soil. Consider the pH and texture.
3.  **Recommend soil amendments**: Provide a list of actionable suggestions to improve the soil's health and productivity. For example, if the pH is too low, suggest adding lime. If organic carbon is low, suggest adding compost. Be specific.

Generate the output in the specified JSON format.`,
});

const soilAnalysisFlow = ai.defineFlow(
    {
        name: 'soilAnalysisFlow',
        inputSchema: SoilAnalysisInputSchema,
        outputSchema: SoilAnalysisOutputSchema,
    },
    async (input) => {
        const { output } = await soilAnalysisPrompt(input);
        if (!output) {
            throw new Error("AI failed to generate a soil analysis.");
        }
        return output;
    }
);
