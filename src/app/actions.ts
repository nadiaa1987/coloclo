'use server';

import { generateImageFromPrompt, GenerateImageFromPromptInput } from '@/ai/flows/generate-image-from-prompt';
import { generatePrompts, GeneratePromptsInput } from '@/ai/flows/generate-prompts-flow';
import { db } from '@/lib/firebase';
import { stripe } from '@/lib/stripe';
import { collection, serverTimestamp, writeBatch, doc, getDoc, updateDoc } from 'firebase/firestore';
import { headers } from 'next/headers';
import Stripe from 'stripe';

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
  prompts: string[]
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

type BookData = {
  name: string;
  topic: string;
  pages: any[];
  kdpSettings: any;
  titlePageSettings: any;
};

export async function saveBookAction(
  { userId, bookData }: { userId: string; bookData: BookData }
): Promise<{ success:boolean; error?: string }> {
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


export async function createCheckoutSessionAction({
  userId,
  plan,
}: {
  userId: string;
  plan: 'monthly' | 'yearly';
}): Promise<{ success: boolean; url?: string; error?: string }> {
  try {
    if (!userId) {
      throw new Error('User is not authenticated.');
    }

    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);
    const userData = userDoc.data();

    if (!userData) {
      throw new Error('User data not found.');
    }

    let stripeCustomerId = userData.stripeCustomerId;

    // Create a new Stripe customer if one doesn't exist
    if (!stripeCustomerId) {
      const customer = await stripe.customers.create({
        email: userData.email,
        metadata: {
          firebaseUID: userId,
        },
      });
      stripeCustomerId = customer.id;
      await updateDoc(userRef, { stripeCustomerId: stripeCustomerId });
    }
    
    const priceId = plan === 'monthly'
      ? process.env.STRIPE_MONTHLY_PRICE_ID
      : process.env.STRIPE_YEARLY_PRICE_ID;
      
    if (!priceId) {
        throw new Error(`Price ID for ${plan} plan is not configured.`);
    }

    const origin = headers().get('origin') || 'http://localhost:3000';
    
    const checkoutSession = await stripe.checkout.sessions.create({
      customer: stripeCustomerId,
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${origin}/?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/`,
      metadata: {
        firebaseUID: userId,
      }
    });

    if (!checkoutSession.url) {
      throw new Error('Could not create checkout session.');
    }

    return { success: true, url: checkoutSession.url };
  } catch (error) {
    console.error(error);
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred.';
    return { success: false, error: errorMessage };
  }
}
