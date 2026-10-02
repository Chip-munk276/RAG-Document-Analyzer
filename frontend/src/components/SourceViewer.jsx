import React, { useState } from 'react';
import { 
  FileText, 
  X, 
  ChevronLeft, 
  ChevronRight, 
  BookOpen, 
  Sparkles, 
  ExternalLink,
  Copy,
  Check,
  Zap,
  CheckCircle2
} from 'lucide-react';

export default function SourceViewer({ isOpen, onClose, citationData, document }) {
  const [copied, setCopied] = useState(false);
  
  if (!isOpen || !citationData) return null;

  const pageNum = citationData.pageNumber || 1;
  const chunkText = citationData.text || "Extracted chunk text context from PDF document.";
  const matchScore = Math.round((citationData.score || 0.94) * 100);

  const handleCopyChunk = () => {
    navigator.clipboard.writeText(chunkText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-sm flex justify-end animate-fade-in">
      <div className="w-full max-w-xl glass-panel h-full border-l border-slate-800 flex flex-col shadow-2xl animate-slide-in-right">
        
        {/* Header Bar */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/80">
          <div className="flex items-center gap-3 min-w-0">
            <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <BookOpen className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wide block">PDF Source Citation</span>
              <h3 className="text-sm font-bold text-slate-100 truncate">{document?.fileName || "PDF Document"}</h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* Metadata Grid */}
          <div className="grid grid-cols-3 gap-3 p-4 rounded-xl bg-slate-900/90 border border-slate-800">
            <div>
              <span className="text-[11px] text-slate-400 block">PDF Page</span>
              <span className="text-sm font-bold text-indigo-400">Page {pageNum}</span>
            </div>
            <div>
              <span className="text-[11px] text-slate-400 block">Relevance Match</span>
              <span className="text-sm font-bold text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="h-3.5 w-3.5" />
                {matchScore}%
              </span>
            </div>
            <div>
              <span className="text-[11px] text-slate-400 block">Embedding</span>
              <span className="text-[11px] font-mono text-slate-300">text-embedding-3</span>
            </div>
          </div>

          {/* PDF Page Mock Mockup */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="font-semibold text-slate-200 flex items-center gap-1.5">
                <FileText className="h-4 w-4 text-indigo-400" />
                Extracted Chunk Snippet
              </span>
              <button
                onClick={handleCopyChunk}
                className="text-slate-400 hover:text-indigo-400 flex items-center gap-1 text-[11px] transition"
              >
                {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                <span>{copied ? "Copied" : "Copy Chunk"}</span>
              </button>
            </div>

            {/* Highlighted Box */}
            <div className="p-4 rounded-xl bg-indigo-950/30 border border-indigo-500/30 text-xs sm:text-sm text-slate-200 leading-relaxed font-mono relative shadow-inner">
              <div className="absolute top-2 right-2 px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 text-[10px] font-bold">
                Highlighted Match
              </div>
              <p className="pr-16">"{chunkText}"</p>
            </div>
          </div>

          {/* Surrounding Context Section */}
          <div className="space-y-2">
            <h4 className="text-xs font-semibold text-slate-300">Surrounding Page Context</h4>
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-400 space-y-2 leading-relaxed">
              <p className="opacity-70">
                ... [PDF Page {pageNum} Header Section] ...
              </p>
              <p className="text-slate-300">
                {chunkText}
              </p>
              <p className="opacity-70">
                ... [PDF Page {pageNum} Footer Notes] ...
              </p>
            </div>
          </div>

        </div>

        {/* Drawer Footer Controls */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <button
              onClick={() => alert(`Navigating to PDF Page ${Math.max(1, pageNum - 1)}`)}
              className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white flex items-center gap-1 transition"
            >
              <ChevronLeft className="h-4 w-4" />
              <span>Page {Math.max(1, pageNum - 1)}</span>
            </button>
            <button
              onClick={() => alert(`Navigating to PDF Page ${pageNum + 1}`)}
              className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white flex items-center gap-1 transition"
            >
              <span>Page {pageNum + 1}</span>
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold transition shadow-md shadow-indigo-600/20"
          >
            Done
          </button>
        </div>

      </div>
    </div>
  );
}
