import { useState, useCallback } from 'react';
import { ArrowLeft } from 'lucide-react';
import MochiGreeting from '@/components/visualSearch/MochiGreeting';
import VisualSearchBar from '@/components/visualSearch/VisualSearchBar';
import SearchResultsPanel from '@/components/visualSearch/SearchResultsPanel';
import GenerateWithMochiPanel from '@/components/visualSearch/GenerateWithMochiPanel';
import {
  getSearchResults,    // Real service call
  generateAIContent,   // Gemini Native Image Generation
  type VisualResult,      
  type GeneratedContent   
} from '@/services/visualSearchService';

/**
 * Mochi Virtual Teaching Assistant - Main Interface
 */
const VisualSearch = () => {
  // State management
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<VisualResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  
  const [generatedContent, setGeneratedContent] = useState<GeneratedContent | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  
  const [selectedResult, setSelectedResult] = useState<VisualResult | null>(null);
  const [showResults, setShowResults] = useState(false);

  /**
   * Handle search action (Connects to Google Search API)
   */
  const handleSearch = useCallback(async (query: string) => {
    if (!query.trim()) return;

    setSearchQuery(query);
    setIsSearching(true);
    setHasSearched(true);
    setShowResults(true);

    try {
      // Replaced mock with real service function
      const results = await getSearchResults(query);
      setSearchResults(results);
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  }, []);

  /**
   * Handle AI generation action (Integrated with Gemini 3 Native Generation)
   */
  const handleGenerateWithAI = useCallback(async (query: string) => {
    if (!query.trim()) return;

    // Resetting state for fresh generation
    setGeneratedContent(null); 
    setSearchQuery(query); 
    setIsGenerating(true);
    setShowResults(true);

    try {
      // This calls the generateAIContent in visualSearchService.ts 
      // which uses the Gemini SDK for Native Image generation
      const result = await generateAIContent(query); 
      
      if (result) {
        setGeneratedContent(result);
      }
    } catch (error) {
      console.error('Gemini Generation error:', error);
      // Mochi error state can be handled here if needed
    } finally {
      setIsGenerating(false);
    }
  }, []);

  /**
   * Sidebar Trigger
   */
  const handlePanelGenerate = useCallback(async (queryFromPanel: string) => {
    const activeQuery = queryFromPanel || searchQuery;
    if (activeQuery.trim()) {
      await handleGenerateWithAI(activeQuery);
    }
  }, [searchQuery, handleGenerateWithAI]);

  const handleResultClick = useCallback((result: VisualResult) => {
    setSelectedResult(result);
  }, []);

  const handleBack = useCallback(() => {
    setShowResults(false);
    setHasSearched(false);
    setSearchResults([]);
    setSearchQuery('');
    setGeneratedContent(null);
  }, []);

  // --- UI REMAINS UNCHANGED ---
  if (!showResults) {
    return (
      <div className="min-h-screen bg-sky-50 flex flex-col relative">
        <div className="absolute top-6 left-6 z-20">
          <button 
            onClick={() => window.history.back()} 
            className="p-2 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted transition-all"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center px-4 pb-20">
          <MochiGreeting greeting="Hello! Good Morning" />
          
          <div className="mt-8 w-full max-w-3xl">
            <VisualSearchBar
              onSearch={handleSearch}
              onGenerateWithAI={handleGenerateWithAI}
              isLoading={isSearching || isGenerating}
              placeholder="Search from google"
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-sky-50 flex flex-col relative">
      <div className="p-4 border-b border-border/50">
        <button
          onClick={handleBack}
          className="p-2 rounded-full hover:bg-muted transition-colors"
          aria-label="Go back"
        >
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </button>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row">
        <div className="flex-1 flex flex-col p-4 lg:p-6">
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-foreground mb-3">Results</h2>
            <div className="max-w-3xl">
              <VisualSearchBar
                onSearch={handleSearch}
                onGenerateWithAI={handleGenerateWithAI}
                showButtons={true}
                initialValue={searchQuery}
                isLoading={isSearching || isGenerating}
                placeholder="Show me an apple..."
              />
            </div>
          </div>

          <SearchResultsPanel
            results={searchResults}
            isLoading={isSearching}
            hasSearched={hasSearched}
            onResultClick={handleResultClick}
          />
        </div>

        <div className="lg:border-l border-border/50 p-4 lg:p-6">
          <GenerateWithMochiPanel
            generatedContent={generatedContent}
            isGenerating={isGenerating}
            currentQuery={searchQuery}
            onGenerate={handlePanelGenerate}
          />
        </div>
      </div>
    </div>
  );
}

export default VisualSearch;