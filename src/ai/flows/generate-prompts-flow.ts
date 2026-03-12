'use server';
/**
 * @fileOverview A Genkit flow that generates text prompts for coloring book pages.
 *
 * - generatePrompts - A function that handles the prompt generation process.
 * - GeneratePromptsInput - The input type for the generatePrompts function.
 * - GeneratePromptsOutput - The return type for the generatePrompts function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

// Input schema
const GeneratePromptsInputSchema = z.object({
  topic: z.string().describe('The central theme or topic for the coloring book pages.'),
  count: z.number().int().min(1).max(50).describe('The number of prompts to generate.'),
  style: z.string().describe('The artistic style for the coloring book pages.'),
});
export type GeneratePromptsInput = z.infer<typeof GeneratePromptsInputSchema>;

// Output schema
const GeneratePromptsOutputSchema = z.object({
  prompts: z.array(z.string()).describe('An array of generated text prompts.'),
});
export type GeneratePromptsOutput = z.infer<typeof GeneratePromptsOutputSchema>;


export async function generatePrompts(
  input: GeneratePromptsInput
): Promise<GeneratePromptsOutput> {
  return generatePromptsFlow(input);
}

const generatePromptsFlow = ai.defineFlow(
  {
    name: 'generatePromptsFlow',
    inputSchema: GeneratePromptsInputSchema,
    outputSchema: GeneratePromptsOutputSchema,
  },
  async (input) => {
    const textGenerationPrompt = `You are an expert at creating engaging prompts for coloring book pages.
Generate ${input.count} unique and descriptive prompts based on the topic: '${input.topic}'.
Each prompt should be in the style of '${input.style}'.
Each prompt should describe a scene that would make a great black and white coloring page for kids or adults.
Focus on clear, simple, and imaginative scenes. Avoid overly complex or abstract ideas.
The output should be only the list of prompts, each on a new line. No extra commentary, no titles, just the list.`;

    // Use POST /v1/chat/completions (OpenAI-compatible) instead of GET /text/{prompt}
    // because the GET endpoint returns 404 when the encoded URL is too long.
    const apiKey = process.env.POLLINATIONS_API_KEY;
    const model = process.env.TEXT_MODEL || 'gemini-fast';

    const response = await fetch('https://gen.pollinations.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: model,
        messages: [
          { role: 'user', content: textGenerationPrompt },
        ],
        temperature: 0.9,
        max_tokens: 2000,
        stream: false,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => response.statusText);
      throw new Error(`Failed to fetch prompts from Pollinations AI: ${response.status} — ${errorText}`);
    }

    const data = await response.json();
    const responseText: string = data?.choices?.[0]?.message?.content ?? '';

    if (!responseText) {
      throw new Error('Pollinations AI returned an empty response.');
    }

    const prompts = responseText
      .split('\n')
      .map((p: string) => p.trim())
      .filter((p: string) => p.length > 0)
      // Remove any list numbering like "1. " or "- "
      .map((p: string) => p.replace(/^\s*(\d+\.|-)\s*/, ''));

    return { prompts };
  }
);
