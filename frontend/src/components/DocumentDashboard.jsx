import React, { useState } from 'react';
import { 
  FileText, 
  Search, 
  Trash2, 
  MessageSquare, 
  Layers, 
  Calendar, 
  HardDrive, 
  ExternalLink, 
  Info, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  X,
  FileCheck,
  ShieldAlert,
  LogIn
} from 'lucide-react';
import DeleteConfirmModal from './DeleteConfirmModal';

export default function DocumentDashboard({ 
  documents, 
  selectedDocId, 
  onSelectDoc, 
  onDeleteDoc, 
  onNavigateToUpload, 
  onNavigateToChat,
  user,
  onOpenAuth
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [inspectDoc, setInspectDoc] = useState(null); // For Chunk Inspection modal
  const [docToDelete, setDocToDelete] = useState(null); // For Delete Confirmation modal

  const filteredDocs = documents.filter(doc => {
    const matchesSearch = doc.fileName.toLowerCase().includes(searchTerm.toLowerCase());
    const docStatus = (doc.status || 'INDEXED').toUpperCase();
    const matchesStatus = statusFilter === 'ALL' || docStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalSizeBytes = documents.reduce((acc, d) => acc + (d.fileSize || 0), 0);

  const formatBytes = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const formatDate = (isoString) => {
    if (!isoString) return 'Recent';
    const d = new Date(isoString);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 space-y-8">
      
      {/* Unauthenticated Notification Banner */}
      {!user && (
        <div className="p-4 rounded-2xl bg-indigo-950/40 border border-indigo-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-fade-in">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-indigo-500/20 text-indigo-400">
              <ShieldAlert className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-zinc-100">Account Required</h4>
              <p className="text-xs text-zinc-400">Sign in to isolate your PDF knowledge base, chat histories, and delete vectors securely.</p>
            </div>
          </div>
          <button
            onClick={onOpenAuth}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/30 transition self-end sm:self-auto"
          >
            <LogIn className="h-4 w-4" />
            <span>Sign In / Register</span>
          </button>
        </div>
      )}

      {/* Title & Stats Summary Cards */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-100 tracking-tight">
            PDF Document <span className="gradient-text">Knowledge Hub</span>
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Manage vector-indexed PDF documents ready for semantic search & retrieval.
          </p>
        </div>
        <button
          onClick={() => {
            if (!user) {
              onOpenAuth();
            } else {
              onNavigateToUpload();
            }
          }}
          className="self-start md:self-auto flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/20 transition"
        >
          <FileText className="h-4 w-4" />
          <span>+ Upload New PDF</span>
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-xl">
        <div className="p-4 rounded-xl glass-card border border-neutral-800">
          <div className="flex items-center justify-between text-zinc-400 mb-2">
            <span className="text-xs font-medium">Total PDF Documents</span>
            <FileText className="h-4 w-4 text-indigo-400" />
          </div>
          <span className="text-2xl font-bold text-zinc-100">{documents.length}</span>
        </div>

        <div className="p-4 rounded-xl glass-card border border-neutral-800">
          <div className="flex items-center justify-between text-zinc-400 mb-2">
            <span className="text-xs font-medium">Total Storage Usage</span>
            <HardDrive className="h-4 w-4 text-amber-400" />
          </div>
          <span className="text-2xl font-bold text-zinc-100">{formatBytes(totalSizeBytes)}</span>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="glass-panel p-4 rounded-2xl border border-neutral-800 flex flex-col sm:flex-row items-center justify-between gap-4">
        
        {/* Search Input */}
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-400" />
          <input
            type="text"
            placeholder="Search PDF filenames..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-neutral-900 border border-neutral-800 rounded-xl pl-9 pr-4 py-2 text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-indigo-500"
          />
        </div>

        {/* Status Pills */}
        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto">
          {['ALL', 'INDEXED', 'PROCESSING', 'FAILED'].map(status => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer ${
                statusFilter === status
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'bg-neutral-900 text-zinc-400 hover:text-zinc-200 border border-neutral-800 hover:bg-neutral-800'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Documents Table / Grid */}
      {filteredDocs.length === 0 ? (
        <div className="text-center py-16 glass-panel rounded-2xl border border-neutral-800 space-y-3">
          <FileText className="mx-auto h-12 w-12 text-zinc-600" />
          <h3 className="text-base font-semibold text-zinc-300">No PDF documents found</h3>
          <p className="text-xs text-zinc-500 max-w-sm mx-auto">
            {searchTerm ? `No PDF matches "${searchTerm}"` : 'Get started by uploading your first PDF document to the RAG engine.'}
          </p>
          <button
            onClick={() => {
              if (!user) {
                onOpenAuth();
              } else {
                onNavigateToUpload();
              }
            }}
            className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-500 transition"
          >
            Upload PDF Document
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredDocs.map((doc) => {
            const isSelected = doc.id === selectedDocId;

            return (
              <div
                key={doc.id}
                className={`glass-card rounded-2xl p-5 border transition-all duration-200 flex flex-col justify-between space-y-4 ${
                  isSelected
                    ? 'border-indigo-500 bg-indigo-950/20 shadow-lg shadow-indigo-500/10 ring-1 ring-indigo-500/30'
                    : 'border-neutral-800 hover:border-neutral-700'
                }`}
              >
                {/* Header info */}
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="p-2.5 rounded-xl bg-red-500/10 text-red-400 border border-red-500/20 flex-shrink-0">
                        <FileText className="h-5 w-5" />
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-sm font-semibold text-zinc-100 truncate" title={doc.fileName}>
                          {doc.fileName}
                        </h4>
                        <span className="text-[11px] text-zinc-400 block mt-0.5">
                          {formatBytes(doc.fileSize)} • PDF Document
                        </span>
                      </div>
                    </div>

                    {/* Status Badge */}
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold flex items-center gap-1 ${
                      doc.status === 'INDEXED' 
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                        : doc.status === 'PROCESSING'
                        ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                        : 'bg-red-500/10 text-red-400 border border-red-500/20'
                    }`}>
                      <CheckCircle2 className="h-3 w-3" />
                      {doc.status || 'INDEXED'}
                    </span>
                  </div>
                </div>

                {/* Footer Controls */}
                <div className="pt-2 border-t border-neutral-800/80 flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setInspectDoc(doc)}
                      title="Inspect PDF Chunks"
                      className="p-2 rounded-lg text-zinc-400 hover:text-indigo-400 hover:bg-neutral-800 transition text-xs flex items-center gap-1"
                    >
                      <Info className="h-4 w-4" />
                      <span className="text-[11px] font-medium hidden sm:inline">Chunks</span>
                    </button>
                    <button
                      onClick={() => setDocToDelete(doc)}
                      title="Delete Document & Vectors"
                      className="p-2 rounded-lg text-zinc-400 hover:text-red-400 hover:bg-red-500/10 transition group"
                    >
                      <Trash2 className="h-4 w-4 group-hover:scale-110 transition-transform" />
                    </button>
                  </div>

                  <button
                    onClick={() => {
                      onSelectDoc(doc.id);
                      onNavigateToChat(doc.id);
                    }}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                      isSelected
                        ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                        : 'bg-neutral-800 hover:bg-neutral-700 text-zinc-200'
                    }`}
                  >
                    <MessageSquare className="h-3.5 w-3.5" />
                    <span>{isSelected ? 'Active for Chat' : 'Chat with PDF'}</span>
                  </button>
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* Chunk Inspector Modal */}
      {inspectDoc && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="glass-panel w-full max-w-2xl rounded-2xl border border-neutral-800 max-h-[85vh] flex flex-col shadow-2xl">
            
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-neutral-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <FileText className="h-5 w-5 text-indigo-400" />
                <div>
                  <h3 className="text-sm font-bold text-zinc-100">{inspectDoc.fileName}</h3>
                  <p className="text-[11px] text-zinc-400">Vector Chunks & Page Breakdown</p>
                </div>
              </div>
              <button 
                onClick={() => setInspectDoc(null)}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-200 hover:bg-neutral-800"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Chunks List */}
            <div className="p-4 sm:p-6 overflow-y-auto space-y-3 flex-1">
              {(inspectDoc.chunks || [
                { chunkId: 'c1', pageNumber: 1, text: 'Sample vector chunk text extracted from PDF page 1.', score: 0.96 },
                { chunkId: 'c2', pageNumber: 2, text: 'Secondary chunk details containing key performance indicators.', score: 0.91 }
              ]).map((chunk, idx) => (
                <div key={idx} className="p-3.5 rounded-xl bg-neutral-900/90 border border-neutral-800 text-xs space-y-2">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-semibold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
                      PDF Page {chunk.pageNumber} • Chunk #{idx + 1}
                    </span>
                    <span className="text-zinc-400">Embedding: nomic-embed-text</span>
                  </div>
                  <p className="text-zinc-300 font-mono text-[11px] leading-relaxed bg-zinc-950/70 p-2.5 rounded-lg border border-neutral-800/80">
                    "{chunk.text}"
                  </p>
                </div>
              ))}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-neutral-800 bg-zinc-950/50 flex justify-end">
              <button
                onClick={() => setInspectDoc(null)}
                className="px-4 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-zinc-200 text-xs font-semibold"
              >
                Close Inspector
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={Boolean(docToDelete)}
        onClose={() => setDocToDelete(null)}
        document={docToDelete}
        onConfirm={async (id) => {
          await onDeleteDoc(id);
          setDocToDelete(null);
        }}
      />

    </div>
  );
}
