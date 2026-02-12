import { useState, useCallback } from 'react';
import { generateAIContent, GeneratedContent } from '@/services/visualSearchService';

/**
 * Hook for AI image generation using our Python Backend.
 */
export function useAIImageGeneration() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // NEW: Add state to store the result so the UI actually updates!
  const [generatedImage, setGeneratedImage] = useState<GeneratedContent | null>(null);

  const generateImage = useCallback(async (prompt: string): Promise<GeneratedContent | null> => {
    const trimmedPrompt = prompt.trim();
    if (!trimmedPrompt) return null;

    setIsGenerating(true);
    setError(null);
    // Optional: Clear previous image while loading new one
    // setGeneratedImage(null); 

    try {
      // Calling the service that talks to our Flask Backend
      const result = await generateAIContent(trimmedPrompt);
      
      // Update the local state so the component re-renders with the new image
      setGeneratedImage(result);
      
      return result;
    } catch (err: any) {
      console.error('Hook Generation Error:', err);
      setError('Mochi is a bit tired. Let’s try drawing that again!');
      return null;
    } finally {
      setIsGenerating(false);
    }
  }, []);

  // Return generatedImage so your UI component can use it
  return { generateImage, isGenerating, error, generatedImage, setGeneratedImage };
}

export default useAIImageGeneration;