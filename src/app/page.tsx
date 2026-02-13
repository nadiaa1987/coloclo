"use client";

import { useState } from 'react';
import { ImageGenerator } from "@/components/image-generator";
import { PromptGenerator } from "@/components/prompt-generator";

export default function Home() {
  const [step, setStep] = useState<'prompt' | 'image'>('prompt');
  const [prompts, setPrompts] = useState<string[]>([]);
  const [topic, setTopic] = useState<string>('');

  const handlePromptsGenerated = (generatedPrompts: string[], bookTopic: string) => {
    setPrompts(generatedPrompts);
    setTopic(bookTopic);
    setStep('image');
  };

  const handleBack = () => {
    setStep('prompt');
    setPrompts([]);
    setTopic('');
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
          onBack={handleBack}
        />
      )}
    </main>
  );
}
