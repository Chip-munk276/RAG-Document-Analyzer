import React, { useState, useRef } from 'react';
import { 
  FileText, 
  Upload, 
  CheckCircle2, 
  AlertTriangle, 
  ArrowRight, 
  Sparkles, 
  Database, 
  Cpu, 
  Zap, 
  FileCheck,
  RefreshCw,
  X
} from 'lucide-react';
import { uploadPDFDocument } from '../services/api';

export default function UploadScreen({ onUploadSuccess, onNavigateToChat }) {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [pipelineStage, setPipelineStage] = useState('');
  const [uploadedDoc, setUploadedDoc] = useState(null);
  const inputRef = useRef(null);

  // Validate PDF extension strictly
  const validateFile = (file) => {
    if (!file) return false;
    const isPdf = file.name.toLowerCase().endsWith('.pdf') || file.type === 'application/pdf';
    if (!isPdf) {
      setErrorMsg(`Invalid file type "${file.name}". Only PDF files (.pdf) are allowed.`);
      return false;
    }
    if (file.size > 50 * 1024 * 1024) { // 50MB limit
      setErrorMsg(`File size exceeds 50MB limit. Please upload a smaller PDF.`);
      return false;
    }
    setErrorMsg(null);
    return true;
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (validateFile(file)) {
        setSelectedFile(file);
      }
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (validateFile(file)) {
        setSelectedFile(file);
      }
    }
  };

  const handleStartUpload = async () => {
    if (!selectedFile) return;
    setUploading(true);
    setProgress(0);
    setErrorMsg(null);
    setPipelineStage('Uploading PDF file...');

    try {
      // Stage progress simulation & callback
      const stageTimer1 = setTimeout(() => setPipelineStage('Extracting text & PDF pages...'), 700);
      const stageTimer2 = setTimeout(() => setPipelineStage('Generating dense vector embeddings...'), 1400);
      const stageTimer3 = setTimeout(() => setPipelineStage('Storing in Vector Database index...'), 2100);

      const newDoc = await uploadPDFDocument(selectedFile, (pct) => {
        setProgress(pct);
      });

      clearTimeout(stageTimer1);
      clearTimeout(stageTimer2);
      clearTimeout(stageTimer3);

      setProgress(100);
      setPipelineStage('Complete!');
      setUploadedDoc(newDoc);
      if (onUploadSuccess) onUploadSuccess(newDoc);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to process and index PDF document.');
    } finally {
      setUploading(false);
    }
  };

  const resetUpload = () => {
    setSelectedFile(null);
    setUploadedDoc(null);
    setErrorMsg(null);
    setProgress(0);
    setPipelineStage('');
  };

  const formatBytes = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6">
      
      {/* Title & Banner */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold mb-4">
          <Sparkles className="h-3.5 w-3.5" />
          <span>Automated Vector Indexing Pipeline</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-100 mb-3">
          Upload PDF Document for <span className="gradient-text">RAG Intelligence</span>
        </h1>
        <p className="text-sm text-slate-400 max-w-xl mx-auto">
          Upload any PDF report, research paper, or manual. Our system automatically parses pages, builds dense embeddings, and prepares your PDF for instant semantic retrieval.
        </p>
      </div>

      {/* Error Alert Message */}
      {errorMsg && (
        <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 flex items-start gap-3 text-red-400 text-sm animate-fade-in">
          <AlertTriangle className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <span className="font-semibold block mb-0.5">Upload Error</span>
            <span>{errorMsg}</span>
          </div>
          <button onClick={() => setErrorMsg(null)} className="text-red-400 hover:text-red-300">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Main Upload Card Container */}
      {!uploadedDoc ? (
        <div className="glass-panel rounded-2xl p-6 sm:p-8 shadow-2xl border border-slate-800">
          
          {/* File Input Hidden */}
          <input
            ref={inputRef}
            type="file"
            accept=".pdf,application/pdf"
            onChange={handleFileChange}
            className="hidden"
          />

          {/* Drag & Drop Area */}
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => !uploading && inputRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl p-8 sm:p-12 text-center transition-all duration-200 cursor-pointer ${
              dragActive
                ? 'border-indigo-500 bg-indigo-500/10 scale-[1.01]'
                : selectedFile
                ? 'border-indigo-500/50 bg-indigo-950/20'
                : 'border-slate-800 hover:border-slate-700 bg-slate-900/40 hover:bg-slate-900/80'
            }`}
          >
            <div className="mx-auto w-16 h-16 mb-4 rounded-2xl bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 shadow-inner">
              <FileText className="h-8 w-8" />
            </div>

            <h3 className="text-lg font-semibold text-slate-200 mb-1">
              {dragActive ? "Drop PDF file here" : "Click to select or drag & drop PDF"}
            </h3>
            
            <p className="text-xs text-slate-400 mb-4 max-w-sm mx-auto">
              Strictly PDF format supported (.pdf up to 50MB)
            </p>

            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-800 text-slate-300 text-xs font-medium">
              <Upload className="h-3.5 w-3.5" />
              <span>Browse PDF Files</span>
            </span>
          </div>

          {/* Selected File Details Bar */}
          {selectedFile && !uploading && (
            <div className="mt-6 p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between animate-fade-in">
              <div className="flex items-center gap-3 min-w-0">
                <div className="p-2.5 rounded-lg bg-red-500/10 text-red-400 border border-red-500/20">
                  <FileText className="h-6 w-6" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-slate-200 truncate">{selectedFile.name}</p>
                  <p className="text-xs text-slate-400">{formatBytes(selectedFile.size)} • PDF Document</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={resetUpload}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  onClick={handleStartUpload}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/30 transition-all"
                >
                  <Zap className="h-4 w-4" />
                  <span>Start RAG Indexing</span>
                </button>
              </div>
            </div>
          )}

          {/* Uploading Progress Indicator */}
          {uploading && (
            <div className="mt-6 p-6 rounded-xl bg-slate-900/90 border border-indigo-500/30 space-y-4 animate-fade-in">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-indigo-400 flex items-center gap-2">
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  {pipelineStage}
                </span>
                <span className="font-mono font-bold text-slate-300">{progress}%</span>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden p-0.5">
                <div
                  className="bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-400 h-full rounded-full transition-all duration-300 shadow-md shadow-indigo-500/50"
                  style={{ width: `${progress}%` }}
                />
              </div>

              <div className="grid grid-cols-3 gap-2 pt-2 text-[11px] text-slate-400 border-t border-slate-800/80">
                <div className="flex items-center gap-1.5">
                  <FileCheck className="h-3.5 w-3.5 text-emerald-400" />
                  <span>1. PDF Extraction</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Cpu className="h-3.5 w-3.5 text-indigo-400" />
                  <span>2. Vector Embeddings</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Database className="h-3.5 w-3.5 text-purple-400" />
                  <span>3. Vector Index Store</span>
                </div>
              </div>
            </div>
          )}

        </div>
      ) : (
        /* Upload Success View */
        <div className="glass-panel rounded-2xl p-8 shadow-2xl border border-emerald-500/30 text-center animate-slide-up space-y-6">
          <div className="mx-auto w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-lg shadow-emerald-500/20">
            <CheckCircle2 className="h-8 w-8" />
          </div>

          <div>
            <h2 className="text-2xl font-bold text-slate-100">PDF Successfully Indexed!</h2>
            <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
              Your document <span className="text-indigo-300 font-semibold">{uploadedDoc.fileName}</span> is ready for question answering.
            </p>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-3 gap-4 max-w-md mx-auto p-4 rounded-xl bg-slate-900/80 border border-slate-800 text-left">
            <div>
              <span className="text-[11px] text-slate-400 block">PDF File</span>
              <span className="text-xs font-semibold text-slate-200 truncate block">{uploadedDoc.fileName}</span>
            </div>
            <div>
              <span className="text-[11px] text-slate-400 block">Est. Pages</span>
              <span className="text-xs font-semibold text-indigo-400">{uploadedDoc.pageCount || 12} Pages</span>
            </div>
            <div>
              <span className="text-[11px] text-slate-400 block">Status</span>
              <span className="text-xs font-semibold text-emerald-400">READY</span>
            </div>
          </div>

          <div className="flex items-center justify-center gap-4 pt-2">
            <button
              onClick={resetUpload}
              className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 text-xs font-semibold transition"
            >
              Upload Another PDF
            </button>
            <button
              onClick={() => onNavigateToChat && onNavigateToChat(uploadedDoc.id)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/30 transition-all"
            >
              <span>Start RAG Chat</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Feature Highlights Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8">
        <div className="p-4 rounded-xl glass-card border border-slate-800/80">
          <FileText className="h-5 w-5 text-indigo-400 mb-2" />
          <h4 className="text-xs font-semibold text-slate-200">Native PDF Layout Parser</h4>
          <p className="text-[11px] text-slate-400 mt-1">Extracts clean page numbers, tables, and headers preserving exact document layout.</p>
        </div>
        <div className="p-4 rounded-xl glass-card border border-slate-800/80">
          <Cpu className="h-5 w-5 text-purple-400 mb-2" />
          <h4 className="text-xs font-semibold text-slate-200">Dense Vector Embeddings</h4>
          <p className="text-[11px] text-slate-400 mt-1">Generates multi-dimensional text embeddings for context-aware semantic search.</p>
        </div>
        <div className="p-4 rounded-xl glass-card border border-slate-800/80">
          <Database className="h-5 w-5 text-emerald-400 mb-2" />
          <h4 className="text-xs font-semibold text-slate-200">Interactive Page Citations</h4>
          <p className="text-[11px] text-slate-400 mt-1">Every AI response includes clickable PDF source chips with page context preview.</p>
        </div>
      </div>

    </div>
  );
}
