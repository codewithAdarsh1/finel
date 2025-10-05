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
