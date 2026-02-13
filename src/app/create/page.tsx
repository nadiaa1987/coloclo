"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { ImageGenerator } from "@/components/image-generator";
import { PromptGenerator } from "@/components/prompt-generator";
import { PageOrderer } from '@/components/page-orderer';
import { Loader2 } from 'lucide-react';

type ImageResult = {
  id: string;
  imageUrl: string;
  prompt: string;
};

type KdpSettings = {
  size: string;
  bleed: string;
};

export default function CreatePage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [step, setStep] = useState<'prompt' | 'image' | 'order'>('prompt');
  const [prompts, setPrompts] = useState<string[]>([]);
  const [topic, setTopic] = useState<string>('');
  const [finalImages, setFinalImages] = useState<ImageResult[]>([]);
  const [kdpSettings, setKdpSettings] = useState<KdpSettings>({ size: '8.5x11', bleed: 'no-bleed' });

  useEffect(() => {
    // If not loading and no user, redirect to login
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);


  const handlePromptsGenerated = (generatedPrompts: string[], bookTopic: string, settings: KdpSettings) => {
    setPrompts(generatedPrompts);
    setTopic(bookTopic);
    setKdpSettings(settings);
    setStep('image');
  };

  const handleImagesGenerated = (images: ImageResult[]) => {
    setFinalImages(images);
    setStep('order');
  }

  const handleBackToPrompt = () => {
    setStep('prompt');
    setPrompts([]);
    setTopic('');
    setFinalImages([]);
  };

  const handleBackToImages = () => {
    setStep('image');
  };

  // While loading or if no user, show a loading spinner
  if (loading || !user) {
    return (
      <main className="flex items-center justify-center min-h-[calc(100vh-57px)]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </main>
    );
  }

  // If user is logged in, show the app
  return (
    <main className="min-h-screen w-full">
      {step === 'prompt' && (
        <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
            <PromptGenerator onPromptsGenerated={handlePromptsGenerated} />
        </div>
      )}
      {step === 'image' && (
        <ImageGenerator 
          initialPrompts={prompts}
          bookTopic={topic}
          onBack={handleBackToPrompt}
          onImagesGenerated={handleImagesGenerated}
        />
      )}
      {step === 'order' && (
        <PageOrderer
          initialImages={finalImages}
          bookTopic={topic}
          onBack={handleBackToImages}
          kdpSettings={kdpSettings}
        />
      )}
    </main>
  );
}
