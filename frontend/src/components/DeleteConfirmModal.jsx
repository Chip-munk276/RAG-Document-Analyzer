import React, { useState } from 'react';
import { 
  AlertTriangle, 
  Trash2, 
  X, 
  Layers, 
  MessageSquare, 
  FileText,
  CheckCircle2
} from 'lucide-react';

export default function DeleteConfirmModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  document 
}) {
  const [deleting, setDeleting] = useState(false);

  if (!isOpen || !document) return null;

  const handleConfirm = async () => {
    setDeleting(true);
    try {
      await onConfirm(document.id);
      onClose();
    } catch (err) {
      console.error("Deletion error:", err);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
      <div className="glass-panel w-full max-w-md rounded-2xl border border-red-500/30 p-6 sm:p-7 shadow-2xl relative bg-zinc-950/95 space-y-5">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          disabled={deleting}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-zinc-400 hover:text-zinc-200 hover:bg-neutral-800 transition"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Warning Icon & Header */}
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 flex-shrink-0">
            <AlertTriangle className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-zinc-100">
              Permanently Delete Document?
            </h3>
            <p className="text-xs text-zinc-400 mt-1">
              This action cannot be undone. All indexed data will be wiped out.
            </p>
          </div>
        </div>

        {/* Target Doc Card */}
        <div className="p-3.5 rounded-xl bg-neutral-900 border border-neutral-800 flex items-center gap-3 text-xs">
          <div className="p-2 rounded-lg bg-red-500/10 text-red-400">
            <FileText className="h-4 w-4" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-semibold text-zinc-200 truncate">{document.fileName}</p>
            <p className="text-[11px] text-zinc-500">Document ID: #{document.id}</p>
          </div>
        </div>

        {/* Cascade Clean-up Scope Checklist */}
        <div className="p-3.5 rounded-xl bg-red-950/20 border border-red-900/30 space-y-2 text-[11px] text-zinc-300">
          <span className="font-semibold text-red-400 block mb-1">
            Clean-up Operations Performed:
          </span>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-3.5 w-3.5 text-red-400 flex-shrink-0" />
            <span>Document record removed from database</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-3.5 w-3.5 text-red-400 flex-shrink-0" />
            <span>All pgvector chunks & dense embeddings purged</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-3.5 w-3.5 text-red-400 flex-shrink-0" />
            <span>Chat session and all conversation history erased</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            onClick={onClose}
            disabled={deleting}
            className="px-4 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-zinc-300 text-xs font-semibold transition"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={deleting}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-semibold shadow-lg shadow-red-600/30 transition disabled:opacity-50"
          >
            {deleting ? (
              <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Trash2 className="h-4 w-4" />
            )}
            <span>{deleting ? 'Deleting Everything...' : 'Delete Document'}</span>
          </button>
        </div>

      </div>
    </div>
  );
}
