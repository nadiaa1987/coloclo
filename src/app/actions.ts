'use server';

import { generateImageFromPrompt, GenerateImageFromPromptInput } from '@/ai/flows/generate-image-from-prompt';
import { generatePrompts, GeneratePromptsInput } from '@/ai/flows/generate-prompts-flow';

export async function generatePromptsAction(
  input: GeneratePromptsInput
): Promise<{ success: boolean; prompts?: string[]; error?: string }> {
  try {
    const { prompts } = await generatePrompts(input);
    return { success: true, prompts };
  } catch (error) {
    console.error(error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to generate prompts.';
    return { success: false, error: errorMessage };
  }
}

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

export async function regenerateImageAction(
  input: GenerateImageFromPromptInput
): Promise<{ success: boolean; imageUrl?: string; error?: string }> {
  try {
    const output = await generateImageFromPrompt(input);
    return { success: true, imageUrl: output.imageUrl };
  } catch (error) {
    console.error(error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to generate image.';
    return { success: false, error: errorMessage };
  }
}
