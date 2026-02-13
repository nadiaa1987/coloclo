"use client";

import { useState } from 'react';
import { ImageGenerator } from "@/components/image-generator";
import { PromptGenerator } from "@/components/prompt-generator";
import { PageOrderer } from '@/components/page-orderer';

type ImageResult = {
  id: string;
  imageUrl: string;
  prompt: string;
};

type KdpSettings = {
  size: string;
  bleed: string;
};

export default function Home() {
  const [step, setStep] = useState<'prompt' | 'image' | 'order'>('prompt');
  const [prompts, setPrompts] = useState<string[]>([]);
  const [topic, setTopic] = useState<string>('');
  const [finalImages, setFinalImages] = useState<ImageResult[]>([]);
  const [kdpSettings, setKdpSettings] = useState<KdpSettings>({ size: '8.5x11', bleed: 'no-bleed' });

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
