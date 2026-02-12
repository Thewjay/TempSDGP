import { useState, useEffect } from "react";
import { Sparkles, Loader2, Camera, Wand2, X, Maximize2 } from 'lucide-react'; 
import { Button } from "@/components/ui/button"; 
import { Card } from "@/components/ui/card";
import mochiMascot from '@/assets/mochi-avatar.jpeg';
import type { GeneratedContent } from '@/services/visualSearchService';
import EmptyState from './EmptyState';

interface GenerateWithMochiPanelProps {
  generatedContent: GeneratedContent | null;
  isGenerating: boolean;
  currentQuery: string;
  onGenerate: (query: string) => Promise<void>; 
}

const GenerateWithMochiPanel = ({
  generatedContent,
  isGenerating,
  currentQuery,
  onGenerate
}: GenerateWithMochiPanelProps) => {
  
  const [error, setError] = useState<string | null>(null);
  const [isPopupOpen, setIsPopupOpen] = useState(false);

  // Clear errors when the user types a new search
  useEffect(() => {
    setError(null);
  }, [currentQuery]);

  const handleGenerate = async () => {
    if (!currentQuery || !currentQuery.trim() || isGenerating) return;
    setError(null);
    try {
      await onGenerate(currentQuery.trim());
    } catch (err: any) {
      // Direct feedback if the backend or AI fails
      setError(err.message || "Mochi had trouble creating that. Let's try again!");
    }
  };

  return (
    <>
      <Card className="w-full lg:w-[450px] p-8 bg-white border-[4px] border-sky-100 rounded-[3rem] flex flex-col animate-fade-in shadow-2xl shadow-sky-100/50 relative overflow-hidden">
        
        {/* Background Decorations */}
        <div className="absolute -top-6 -right-6 w-24 h-24 bg-yellow-100 rounded-full blur-2xl opacity-50" />
        <div className="absolute -bottom-6 -left-6 w-24 h-24 bg-pink-100 rounded-full blur-2xl opacity-50" />

        {/* Mochi Header */}
        <div className="flex items-center gap-4 mb-8 pb-6 border-b-2 border-slate-50 relative z-10">
          <div className="w-16 h-16 rounded-[1.5rem] bg-gradient-to-br from-sky-400 to-indigo-500 p-1 shadow-lg rotate-3">
            <div className="w-full h-full rounded-[1.2rem] bg-white flex items-center justify-center overflow-hidden">
              <img 
                src={mochiMascot} 
                alt="Mochi Mascot" 
                className="w-14 h-14 object-contain"
              />
            </div>
          </div>
          <div>
            <h2 className="font-nunito text-2xl font-black text-slate-700 tracking-tight leading-none">
              Mochi's Magic Studio
            </h2>
            <div className="flex items-center gap-1.5 mt-1">
              <Wand2 className="w-3 h-3 text-sky-500" />
              <p className="text-[10px] text-sky-600 font-black uppercase tracking-widest">AI Creative Studio</p>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col items-center justify-center min-h-[320px] relative z-10">
          {isGenerating ? (
            <div className="w-full aspect-[4/3] rounded-[2.5rem] bg-slate-50 border-4 border-dashed border-sky-200 flex flex-col items-center justify-center gap-6 animate-pulse">
              <div className="relative">
                <Loader2 className="w-16 h-16 text-sky-500 animate-spin" />
              </div>
              <p className="text-lg text-slate-600 font-black text-center px-8 leading-tight">
                Mochi is drawing...
              </p>
            </div>
          ) : generatedContent ? (
            <div className="w-full animate-in fade-in zoom-in duration-500">
              <div 
                className="aspect-[4/3] rounded-[2.5rem] p-3 bg-white shadow-xl border-2 border-slate-100 mb-6 group cursor-pointer relative overflow-hidden active:scale-95 transition-all"
                onClick={() => setIsPopupOpen(true)}
              >
                <div className="w-full h-full rounded-[1.8rem] overflow-hidden relative bg-slate-100">
                  <img
                    /* FIX: We use a composite key. If the AI generates a new image, 
                      the end of the Base64/URL string changes, forcing React to 
                      re-mount this tag and show the fresh art immediately.
                    */
                    key={`${generatedContent.id}-${generatedContent.imageUrl.slice(-20)}`}
                    src={generatedContent.imageUrl}
                    alt={generatedContent.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    referrerPolicy="no-referrer"
                    crossOrigin="anonymous"
                  />
                  
                  <div className="absolute inset-0 bg-sky-500/0 group-hover:bg-sky-500/10 flex items-center justify-center transition-all duration-300">
                    <Maximize2 className="w-10 h-10 text-white opacity-0 group-hover:opacity-100 drop-shadow-md" />
                  </div>
                </div>
              </div>
              <h3 className="text-xl font-black text-slate-800 text-center px-2">
                {generatedContent.title}
              </h3>
            </div>
          ) : (
            <div className="w-full aspect-[4/3] rounded-[2.5rem] bg-slate-50 border-4 border-dashed border-slate-200 flex flex-col items-center justify-center p-8 hover:border-sky-200 transition-colors group">
              <div className="w-24 h-24 rounded-[2rem] bg-white shadow-sm flex items-center justify-center mb-6 group-hover:rotate-6 transition-transform">
                <Camera className="w-12 h-12 text-slate-300" />
              </div>
              <p className="text-xl font-black text-slate-400">Ready to Paint!</p>
              <p className="text-sm text-slate-400 mt-3 text-center max-w-[240px] font-medium leading-relaxed">
                {currentQuery 
                  ? `Push the big blue button to see Mochi draw!` 
                  : "Search for a topic, and Mochi will help you draw it!"}
              </p>
            </div>
          )}
        </div>

        {/* Error Notification */}
        {error && (
          <div className="mt-6 p-4 rounded-2xl bg-red-50 border-2 border-red-100 animate-in slide-in-from-top-2">
            <p className="text-red-600 text-sm font-black text-center">
                Oops! {error}
            </p>
          </div>
        )}

        {/* Magic Button */}
        <Button
          onClick={handleGenerate}
          disabled={!currentQuery?.trim() || isGenerating}
          className="mt-8 w-full h-16 rounded-[1.5rem] font-black text-xl shadow-[0_8px_0_rgb(12,148,227)] hover:shadow-[0_4px_0_rgb(12,148,227)] transition-all hover:translate-y-[4px] active:translate-y-[8px] active:shadow-none bg-sky-500 hover:bg-sky-400 text-white flex gap-3"
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-7 h-7 animate-spin" />
              Magic in progress...
            </>
          ) : (
            <>
              {currentQuery ? "Make Magic!" : "Waiting for Topic"}
            </>
          )}
        </Button>
      </Card>

      {/* Full-Screen Modal */}
      {isPopupOpen && generatedContent && (
        <div 
          className="fixed inset-0 z-[100] bg-slate-900/90 backdrop-blur-md flex items-center justify-center p-4 md:p-10 animate-in fade-in duration-300"
          onClick={() => setIsPopupOpen(false)} 
        >
          <div 
            className="relative max-w-4xl w-full h-[80vh] flex flex-col items-center justify-center animate-in zoom-in duration-300"
            onClick={(e) => e.stopPropagation()} 
          >
            <button 
              className="absolute -top-10 right-0 md:-right-12 text-white/70 hover:text-white transition-colors"
              onClick={() => setIsPopupOpen(false)}
            >
              <X className="w-8 h-8 stroke-[3px]" />
            </button>

            <div className="w-full h-full flex flex-col">
              <div className="flex-1 bg-white rounded-[3rem] p-4 shadow-2xl overflow-hidden">
                <img 
                  src={generatedContent.imageUrl} 
                  alt={generatedContent.title}
                  className="w-full h-full object-contain rounded-[2rem]"
                  referrerPolicy="no-referrer"
                  crossOrigin="anonymous"
                />
              </div>
              
              <div className="mt-6 flex items-center justify-between px-6">
                <div>
                  <h3 className="text-white text-3xl font-black tracking-tight">{generatedContent.title}</h3>
                  <p className="text-sky-300 text-lg font-bold flex items-center gap-2">
                    <Sparkles className="w-5 h-5" /> Painted by Mochi
                  </p>
                </div>
                <div className="hidden md:block w-16 h-16 bg-white rounded-2xl p-1 rotate-6 shadow-xl">
                    <img src={mochiMascot} className="w-full h-full object-contain rounded-xl" alt="Mochi" />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default GenerateWithMochiPanel;