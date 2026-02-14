'use server';

import { generateImageFromPrompt, GenerateImageFromPromptInput } from '@/ai/flows/generate-image-from-prompt';
import { generatePrompts, GeneratePromptsInput } from '@/ai/flows/generate-prompts-flow';
import { db } from '@/lib/firebase';
import { collection, serverTimestamp, writeBatch, doc, increment, updateDoc } from 'firebase/firestore';

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
  { prompts, userId }: { prompts: string[], userId: string }
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

  const successfulGenerations = results.filter(r => r.success).length;
  if (successfulGenerations > 0 && userId) {
    try {
        const userDocRef = doc(db, 'users', userId);
        await updateDoc(userDocRef, {
            totalGenerations: increment(successfulGenerations)
        });
    } catch (error) {
        console.error("Failed to update totalGenerations:", error);
    }
  }
  
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

type BookData = {
  name: string;
  topic: string;
  pages: any[];
  kdpSettings: any;
  titlePageSettings: any;
};

export async function saveBookAction(
  { userId, bookData }: { userId: string; bookData: BookData }
): Promise<{ success: boolean; error?: string }> {
  if (!userId) {
    return { success: false, error: "User not authenticated." };
  }

  try {
    const { pages, ...bookMetadata } = bookData;
    const booksCollectionRef = collection(db, "users", userId, "books");
    const newBookRef = doc(booksCollectionRef);
    const batch = writeBatch(db);

    batch.set(newBookRef, {
      ...bookMetadata,
      createdAt: serverTimestamp(),
    });

    const pagesCollectionRef = collection(newBookRef, "pages");
    pages.forEach((page, index) => {
      const pageRef = doc(pagesCollectionRef, page.id || `${index}`);
      batch.set(pageRef, {
        ...page,
        order: index
      });
    });

    await batch.commit();

    return { success: true };
  } catch (error) {
    console.error("Error saving book:", error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to save book to history.';
    return { success: false, error: errorMessage };
  }
}
