import { useState, useCallback } from "react";
import { getSearchResults, VisualResult } from "@/services/visualSearchService";

/**
 * USE GOOGLE SEARCH HOOK
 * Now updated to talk to the Mochi Python Backend!
 */
export const useGoogleSearch = () => {
  const [results, setResults] = useState<VisualResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const search = useCallback(async (query: string) => {
    const trimmedQuery = query.trim();
    if (!trimmedQuery) return;
    
    setIsLoading(true);
    setError(null); 
    
    try {
      // Calls the service that now points to http://localhost:5000/api/search
      const data = await getSearchResults(trimmedQuery);

      if (data && data.length > 0) {
        setResults(data);
        setError(null);
      } else {
        setResults([]);
        setError("Mochi couldn't find any photos for that. Try another word!");
      }
    } catch (err: any) {
      console.error("Hook Search Error:", err);
      // Friendly error message for kids/teachers
      setError("Mochi's search lens is a bit foggy. Try again in a moment!");
      setResults([]);
    } finally {
      setIsLoading(false); 
    }
  }, []);

  return { results, isLoading, error, search };
};