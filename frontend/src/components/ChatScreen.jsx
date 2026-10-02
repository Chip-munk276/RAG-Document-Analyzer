import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, 
  Bot, 
  User, 
  FileText, 
  Sparkles, 
  ExternalLink, 
  Copy, 
  Check, 
  RefreshCw, 
  AlertCircle, 
  BookOpen,
  Clock,
  Zap,
  Trash2
} from 'lucide-react';
import { sendChatMessage } from '../services/api';
import LoadingState from './LoadingState';

export default function ChatScreen({ 
  documents, 
  selectedDocId, 
  setSelectedDocId,
  onOpenSourceViewer
}) {
  const [messages, setMessages] = useState([
    {
      id: 'welcome-1',
      sender: 'bot',
      text: "Hello! I am your **RAG PDF Document Assistant**. Select an uploaded PDF document above and ask me any question. Every answer is grounded in dense vector search with direct clickable PDF page citations.",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      sources: []
    }
  ]);

  const [inputQuery, setInputQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  const messagesEndRef = useRef(null);

  const activeDoc = documents.find(d => d.id === selectedDocId) || documents[0];

  const suggestedQuestions = [
    "What are the main conclusions of this PDF?",
    "Summarize the key metrics and performance figures.",
    "What methodologies or frameworks are outlined in this report?"
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSendMessage = async (textToSend) => {
    const query = textToSend || inputQuery;
    if (!query.trim() || loading || !activeDoc) return;

    const userMsgId = `user-${Date.now()}`;
    const userMsg = {
      id: userMsgId,
      sender: 'user',
      text: query.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    if (!textToSend) setInputQuery('');
    setLoading(true);

    try {
      const response = await sendChatMessage(activeDoc.id, query.trim());

      const botMsg = {
        id: `bot-${Date.now()}`,
        sender: 'bot',
        text: response.answer,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        sources: response.sources || [],
        metrics: response.metrics
      };

      setMessages(prev => [...prev, botMsg]);
    } catch (err) {
      setMessages(prev => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          sender: 'bot',
          isError: true,
          text: `Error generating response: ${err.message || 'Server network error'}`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (id, text) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleClearChat = () => {
    setMessages([
      {
        id: 'welcome-reset',
        sender: 'bot',
        text: `Chat history cleared. Ready to query **${activeDoc?.fileName || 'PDF Document'}**.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        sources: []
      }
    ]);
  };

  return (
    <div className="max-w-5xl mx-auto h-[calc(100vh-5rem)] flex flex-col py-4 px-2 sm:px-4">
      
      {/* Active Document Header Bar */}
      <div className="glass-panel p-3.5 rounded-2xl border border-slate-800 flex items-center justify-between mb-4 shadow-md">
        <div className="flex items-center gap-3 min-w-0">
          <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <FileText className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400 font-medium">Active PDF Context:</span>
              <select
                value={selectedDocId || ''}
                onChange={(e) => setSelectedDocId(Number(e.target.value))}
                className="bg-slate-900 text-xs font-bold text-slate-100 border border-slate-800 rounded-lg px-2.5 py-1 focus:outline-none focus:border-indigo-500 cursor-pointer max-w-[200px] truncate"
              >
                {documents.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.fileName}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <button
          onClick={handleClearChat}
          className="p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 text-xs flex items-center gap-1.5 transition"
          title="Clear Conversation"
        >
          <Trash2 className="h-4 w-4" />
          <span className="hidden sm:inline">Clear Chat</span>
        </button>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto px-2 sm:px-4 py-2 space-y-6">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex items-start gap-3 sm:gap-4 animate-fade-in ${
              msg.sender === 'user' ? 'flex-row-reverse' : ''
            }`}
          >
            {/* Avatar */}
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 text-sm shadow-md ${
                msg.sender === 'user'
                  ? 'bg-gradient-to-tr from-indigo-600 to-indigo-500 text-white shadow-indigo-600/20'
                  : msg.isError
                  ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                  : 'bg-gradient-to-tr from-purple-600 to-indigo-600 text-white shadow-purple-600/20'
              }`}
            >
              {msg.sender === 'user' ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
            </div>

            {/* Bubble Content */}
            <div className={`max-w-[85%] sm:max-w-[75%] space-y-2`}>
              
              <div
                className={`p-4 rounded-2xl text-xs sm:text-sm leading-relaxed shadow-lg ${
                  msg.sender === 'user'
                    ? 'bg-indigo-600 text-white rounded-tr-none'
                    : msg.isError
                    ? 'bg-red-500/10 text-red-300 border border-red-500/30 rounded-tl-none'
                    : 'glass-card border border-slate-800 text-slate-200 rounded-tl-none'
                }`}
              >
                <div className="whitespace-pre-wrap">{msg.text}</div>

                {/* Citations Section */}
                {msg.sources && msg.sources.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-slate-700/50 space-y-2">
                    <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1">
                      <BookOpen className="h-3.5 w-3.5 text-indigo-400" />
                      Grounding Citations (Click to inspect PDF page):
                    </span>

                    <div className="flex flex-wrap gap-2">
                      {msg.sources.map((src, i) => (
                        <button
                          key={i}
                          onClick={() => onOpenSourceViewer && onOpenSourceViewer(src, activeDoc)}
                          className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-[11px] font-medium transition cursor-pointer group"
                        >
                          <FileText className="h-3 w-3 text-indigo-400 group-hover:scale-110 transition-transform" />
                          <span>PDF Page {src.pageNumber}</span>
                          <span className="text-slate-500">•</span>
                          <span className="text-[10px] text-emerald-400 font-mono font-semibold">
                            {Math.round((src.score || 0.94) * 100)}% match
                          </span>
                          <ExternalLink className="h-3 w-3 opacity-60 group-hover:opacity-100" />
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Message Metadata / Actions */}
              <div className="flex items-center gap-3 px-1 text-[10px] text-slate-500">
                <span>{msg.timestamp}</span>
                
                {msg.sender === 'bot' && !msg.isError && (
                  <>
                    <button
                      onClick={() => handleCopy(msg.id, msg.text)}
                      className="hover:text-slate-300 flex items-center gap-1 transition"
                    >
                      {copiedId === msg.id ? (
                        <>
                          <Check className="h-3 w-3 text-emerald-400" />
                          <span className="text-emerald-400">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="h-3 w-3" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>

                    {msg.metrics && (
                      <span className="text-slate-400 flex items-center gap-2 font-mono">
                        <span className="flex items-center gap-0.5 text-indigo-400">
                          <Zap className="h-3 w-3" />
                          {msg.metrics.latencyMs}ms
                        </span>
                        <span>Confidence: {msg.metrics.retrievalConfidence}</span>
                      </span>
                    )}
                  </>
                )}
              </div>

            </div>
          </div>
        ))}

        {/* Loading Indicator */}
        {loading && (
          <div className="animate-fade-in pl-12">
            <LoadingState type="rag-pipeline" />
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Prompts Pill Row */}
      {messages.length < 3 && !loading && (
        <div className="py-2 px-2 flex gap-2 overflow-x-auto">
          {suggestedQuestions.map((q, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(q)}
              className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs text-slate-300 whitespace-nowrap flex items-center gap-1.5 transition"
            >
              <Sparkles className="h-3.5 w-3.5 text-indigo-400" />
              <span>{q}</span>
            </button>
          ))}
        </div>
      )}

      {/* Chat Input Bar */}
      <div className="pt-2">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="glass-panel p-2 rounded-2xl border border-slate-800 flex items-center gap-2 shadow-2xl focus-within:border-indigo-500/60 transition"
        >
          <input
            type="text"
            placeholder={
              activeDoc
                ? `Ask anything about "${activeDoc.fileName}"...`
                : "Upload a PDF document to start chatting..."
            }
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            disabled={loading || !activeDoc}
            className="flex-1 bg-transparent border-0 px-4 py-2.5 text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none disabled:opacity-50"
          />

          <button
            type="submit"
            disabled={!inputQuery.trim() || loading || !activeDoc}
            className="p-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white disabled:opacity-40 disabled:hover:bg-indigo-600 shadow-md shadow-indigo-600/30 transition flex items-center justify-center"
          >
            {loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </button>
        </form>
      </div>

    </div>
  );
}
