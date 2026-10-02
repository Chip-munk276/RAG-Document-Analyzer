import React from 'react';
import { 
  FileText, 
  UploadCloud, 
  MessageSquare, 
  LayoutDashboard, 
  BookOpen, 
  Layers
} from 'lucide-react';

export default function Header({ 
  activeTab, 
  setActiveTab, 
  documents, 
  selectedDocId, 
  setSelectedDocId
}) {
  const activeDoc = documents.find(d => d.id === selectedDocId);

  return (
    <header className="sticky top-0 z-40 glass-panel border-b border-neutral-800/80 bg-black/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand Logo & Title */}
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab('dashboard')}>
          <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-indigo-500/20 ring-1 ring-white/20">
            <Layers className="h-5 w-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg tracking-tight gradient-text">DocAnlz</span>
              <span className="px-2 py-0.5 text-[10px] font-semibold tracking-wide bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-full uppercase">
                RAG Engine
              </span>
            </div>
            <p className="text-[11px] text-zinc-400 font-medium hidden sm:block">AI Document Intelligence System</p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex items-center gap-1 bg-neutral-900/90 p-1 rounded-xl border border-neutral-800">
          <button
            onClick={() => setActiveTab('upload')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${
              activeTab === 'upload' 
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30' 
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-neutral-800/60'
            }`}
          >
            <UploadCloud className="h-4 w-4" />
            <span>Upload PDF</span>
          </button>

          <button
            onClick={() => setActiveTab('dashboard')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${
              activeTab === 'dashboard' 
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30' 
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-neutral-800/60'
            }`}
          >
            <LayoutDashboard className="h-4 w-4" />
            <span>Documents</span>
            {documents.length > 0 && (
              <span className="ml-1 px-1.5 py-0.2 bg-black text-indigo-300 text-[10px] font-bold rounded-full">
                {documents.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('chat')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${
              activeTab === 'chat' 
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30' 
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-neutral-800/60'
            }`}
          >
            <MessageSquare className="h-4 w-4" />
            <span>RAG Chat</span>
          </button>
        </nav>

        {/* Right Section: Active Doc Selector */}
        <div className="flex items-center gap-3">
          {documents.length > 0 && (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-neutral-900 border border-neutral-800 rounded-lg text-xs">
              <FileText className="h-3.5 w-3.5 text-indigo-400" />
              <select
                value={selectedDocId || ''}
                onChange={(e) => setSelectedDocId(Number(e.target.value))}
                className="bg-transparent text-zinc-200 font-medium focus:outline-none cursor-pointer max-w-[150px] truncate"
              >
                {documents.map((doc) => (
                  <option key={doc.id} value={doc.id} className="bg-neutral-900 text-zinc-200">
                    {doc.fileName}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

      </div>
    </header>
  );
}
