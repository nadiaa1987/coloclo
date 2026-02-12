'use server';

import { generateImageFromPrompt, GenerateImageFromPromptInput } from '@/ai/flows/generate-image-from-prompt';

export async function generateImageAction(input: GenerateImageFromPromptInput): Promise<{ success: boolean, imageUrl?: string, error?: string }> {
  try {
    const output = await generateImageFromPrompt(input);
    return { success: true, imageUrl: output.imageUrl };
  } catch (error) {
    console.error(error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to generate image.';
    return { success: false, error: errorMessage };
  }
}
