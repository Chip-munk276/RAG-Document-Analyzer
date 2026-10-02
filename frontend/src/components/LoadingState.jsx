import React, { useState, useEffect } from 'react';
import { Cpu, Database, Sparkles, Layers, RefreshCw } from 'lucide-react';

export default function LoadingState({ type = 'rag-pipeline' }) {
  const [activeStep, setActiveStep] = useState(0);

  const steps = [
    { label: "Generating Query Vector Embedding", icon: Cpu },
    { label: "HNSW Dense Vector Similarity Search", icon: Database },
    { label: "Cross-Encoder Context Reranking", icon: Layers },
    { label: "LLM Response Synthesis", icon: Sparkles },
  ];

  useEffect(() => {
    if (type !== 'rag-pipeline') return;
    const interval = setInterval(() => {
      setActiveStep(prev => (prev < steps.length - 1 ? prev + 1 : prev));
    }, 450);
    return () => clearInterval(interval);
  }, [type]);

  if (type === 'skeleton') {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-6 bg-slate-800 rounded-lg w-1/3"></div>
        <div className="h-24 bg-slate-800/60 rounded-xl w-full"></div>
        <div className="h-24 bg-slate-800/60 rounded-xl w-full"></div>
      </div>
    );
  }

  return (
    <div className="glass-card p-4 rounded-2xl border border-indigo-500/20 max-w-md space-y-3">
      <div className="flex items-center gap-2 text-xs font-semibold text-indigo-400">
        <RefreshCw className="h-4 w-4 animate-spin" />
        <span>Executing RAG Pipeline...</span>
      </div>

      <div className="space-y-2">
        {steps.map((step, idx) => {
          const Icon = step.icon;
          const isDone = idx < activeStep;
          const isCurrent = idx === activeStep;

          return (
            <div
              key={idx}
              className={`flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-xs transition-all ${
                isCurrent
                  ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30'
                  : isDone
                  ? 'text-emerald-400 opacity-80'
                  : 'text-slate-600'
              }`}
            >
              <Icon className={`h-3.5 w-3.5 ${isCurrent ? 'animate-spin-slow text-indigo-400' : ''}`} />
              <span className="font-medium text-[11px]">{step.label}</span>
              {isDone && <span className="ml-auto text-[10px] text-emerald-400 font-bold">✓</span>}
            </div>
          );
        })}
      </div>
    </div>
  );
}
