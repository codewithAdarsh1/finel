'use server';
/**
 * @fileOverview An AI flow for analyzing soil data and providing farming recommendations.
 *
 * - soilAnalysis - A function that takes soil metrics and returns AI-driven advice.
 * - SoilAnalysisInput - The input type for the soilAnalysis function.
 * - SoilAnalysisOutput - The return type for the soilAnalysis function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

export const SoilAnalysisInputSchema = z.object({
  clay: z.number().describe('Clay content in g/kg'),
  sand: z.number().describe('Sand content in g/kg'),
  silt: z.number().describe('Silt content in g/kg'),
  ph: z.number().describe('The pH level of the soil'),
  soc: z.number().describe('Soil organic carbon in g/kg'),
  nitrogen: z.number().optional().describe('Nitrogen content'),
  bdod: z.number().optional().describe('Bulk density of the soil in kg/dm³'),
});
export type SoilAnalysisInput = z.infer<typeof SoilAnalysisInputSchema>;

export const SoilAnalysisOutputSchema = z.object({
  soilType: z.object({
    type: z.string().describe('The classified soil type (e.g., Sandy Loam, Clay).'),
    description: z.string().describe('A brief description of the soil texture and characteristics.'),
  }),
  cropSuggestions: z.array(z.string()).describe('A list of crops that are well-suited for this type of soil.'),
  amendmentSuggestions: z.array(z.string()).describe('A list of suggestions for improving the soil, such as adding specific nutrients or materials.'),
});
export type SoilAnalysisOutput = z.infer<typeof SoilAnalysisOutputSchema>;


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
