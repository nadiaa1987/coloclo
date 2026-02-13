'use server';

import { generateImageFromPrompt } from '@/ai/flows/generate-image-from-prompt';

export async function generateBulkImagesAction(
  { prompts }: { prompts: string[] }
): Promise<{ success: boolean; imageUrl?: string; error?: string; prompt: string }[]> {
  const results = await Promise.all(
    prompts.map(async (prompt) => {
      try {
        const output = await generateImageFromPrompt({ prompt });
        return { success: true, imageUrl: output.imageUrl, prompt };
      } catch (error) {
        console.error(error);
        const errorMessage = error instanceof Error ? error.message : 'Failed to generate image.';
        return { success: false, error: errorMessage, prompt };
      }
    })
  );
  return results;
}
