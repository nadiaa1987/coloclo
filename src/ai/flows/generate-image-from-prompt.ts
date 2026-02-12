'use server';
/**
 * @fileOverview A Genkit flow that generates an image from a text prompt using the Pollinations AI service.
 *
 * - generateImageFromPrompt - A function that handles the image generation process.
 * - GenerateImageFromPromptInput - The input type for the generateImageFromPrompt function.
 * - GenerateImageFromPromptOutput - The return type for the generateImageFromPrompt function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

// Input schema for the image generation prompt.
const GenerateImageFromPromptInputSchema = z.object({
  prompt: z.string().describe('The text prompt for image generation.'),
});
export type GenerateImageFromPromptInput = z.infer<typeof GenerateImageFromPromptInputSchema>;

// Output schema for the generated image.
const GenerateImageFromPromptOutputSchema = z.object({
  imageUrl: z
    .string()
    .describe(
      "The generated image as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'"
    ),
});
export type GenerateImageFromPromptOutput = z.infer<typeof GenerateImageFromPromptOutputSchema>;

/**
 * Generates an image from a text prompt using the Pollinations AI service.
 * @param input - The input containing the text prompt.
 * @returns The generated image as a data URI.
 */
export async function generateImageFromPrompt(
  input: GenerateImageFromPromptInput
): Promise<GenerateImageFromPromptOutput> {
  return generateImageFromPromptFlow(input);
}

// Genkit Flow definition for image generation.
const generateImageFromPromptFlow = ai.defineFlow(
  {
    name: 'generateImageFromPromptFlow',
    inputSchema: GenerateImageFromPromptInputSchema,
    outputSchema: GenerateImageFromPromptOutputSchema,
  },
  async (input) => {
    const encodedPrompt = encodeURIComponent(input.prompt);

    const imageUrl = `https://gen.pollinations.ai/image/${encodedPrompt}`;

    const response = await fetch(imageUrl, {
        headers: {
            'Authorization': 'Bearer sk_UOsZKtGMSYNskyHUmwbWTQEdYPKv2UxR'
        }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch image from Pollinations AI: ${response.statusText}`);
    }

    const imageBuffer = await response.arrayBuffer();
    const contentType = response.headers.get('content-type') || 'image/jpeg'; // Default to jpeg if content-type is not provided

    // Convert the image buffer to a Base64 encoded string.
    const base64Image = Buffer.from(imageBuffer).toString('base64');
    const dataUri = `data:${contentType};base64,${base64Image}`;

    return { imageUrl: dataUri };
  }
);
