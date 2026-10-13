import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import UploadScreen from './components/UploadScreen';
import DocumentDashboard from './components/DocumentDashboard';
import ChatScreen from './components/ChatScreen';
import SourceViewer from './components/SourceViewer';
import AuthModal from './components/AuthModal';
import { ToastNotification } from './components/ErrorAlert';
import { 
  fetchDocuments, 
  deleteDocument, 
  setMockMode, 
  getMockMode,
  getCurrentUser,
  logoutUser
} from './services/api';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [documents, setDocuments] = useState([]);
  const [selectedDocId, setSelectedDocId] = useState(null);
  const [isMockMode, setIsMockState] = useState(false);
  const [toast, setToast] = useState(null);
  const [user, setUser] = useState(() => getCurrentUser());
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authInitialMode, setAuthInitialMode] = useState('login');

  // Source Viewer Drawer state
  const [sourceViewerData, setSourceViewerData] = useState({
    isOpen: false,
    citation: null,
    doc: null
  });

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const loadDocs = async () => {
    try {
      const data = await fetchDocuments();
      setDocuments(data);
      if (data.length > 0) {
        setSelectedDocId(prev => prev && data.some(d => d.id === prev) ? prev : data[0].id);
      } else {
        setSelectedDocId(null);
      }
      setIsMockState(getMockMode());
    } catch (err) {
      console.error("Error fetching documents:", err);
      if (err.message && err.message.includes('session has expired')) {
        showToast("Session expired. Please sign in again.", "error");
        setIsAuthModalOpen(true);
      } else {
        showToast("Unable to load documents from server", "error");
      }
    }
  };

  useEffect(() => {
    loadDocs();

    // Event listeners for session expiration or logout
    const handleExpired = () => {
      setUser(null);
      showToast("Your session has expired. Please log in again.", "warning");
      setIsAuthModalOpen(true);
    };

    const handleLoggedOut = () => {
      setUser(null);
    };

    window.addEventListener('auth:expired', handleExpired);
    window.addEventListener('auth:logout', handleLoggedOut);

    return () => {
      window.removeEventListener('auth:expired', handleExpired);
      window.removeEventListener('auth:logout', handleLoggedOut);
    };
  }, []);

  const handleAuthSuccess = (userData) => {
    setUser(userData);
    showToast(`Authenticated as ${userData.email} (${userData.role || 'USER'})`, "success");
    loadDocs();
  };

  const handleLogout = () => {
    logoutUser();
    setUser(null);
    showToast("Signed out successfully", "info");
    loadDocs();
  };

  const openAuthModal = (mode = 'login') => {
    setAuthInitialMode(mode);
    setIsAuthModalOpen(true);
  };

  const handleUploadSuccess = (newDoc) => {
    setDocuments(prev => [newDoc, ...prev]);
    setSelectedDocId(newDoc.id);
    showToast(`PDF "${newDoc.fileName}" indexed successfully!`, "success");
  };

  const handleDeleteDocument = async (id) => {
    const docToDelete = documents.find(d => d.id === id);
    if (!docToDelete) return;

    try {
      await deleteDocument(id);
      const updated = documents.filter(d => d.id !== id);
      setDocuments(updated);
      if (selectedDocId === id) {
        setSelectedDocId(updated.length > 0 ? updated[0].id : null);
      }
      showToast(`Document "${docToDelete.fileName}" and associated vector embeddings purged.`, "info");
    } catch (err) {
      console.error("Delete failed:", err);
      showToast(`Failed to delete document: ${err.message}`, "error");
    }
  };

  const handleOpenSourceViewer = (citation, doc) => {
    setSourceViewerData({
      isOpen: true,
      citation,
      doc: doc || documents.find(d => d.id === selectedDocId)
    });
  };

  return (
    <div className="min-h-screen bg-black text-zinc-100 flex flex-col font-sans relative selection:bg-indigo-600 selection:text-white">
      
      {/* Background Subtle Ambient Glows */}
      <div className="gradient-glow top-0 left-1/4 w-[500px] h-[500px] bg-indigo-900/40" />
      <div className="gradient-glow top-1/3 right-10 w-[400px] h-[400px] bg-purple-900/30" />
      <div className="gradient-glow bottom-10 left-10 w-[450px] h-[450px] bg-zinc-800/40" />

      {/* Main App Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        documents={documents}
        selectedDocId={selectedDocId}
        setSelectedDocId={setSelectedDocId}
        user={user}
        onOpenAuth={() => openAuthModal('login')}
        onLogout={handleLogout}
      />

      {/* Main View Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto pb-12 z-10">
        {activeTab === 'upload' && (
          <UploadScreen
            user={user}
            onOpenAuth={() => openAuthModal('login')}
            onUploadSuccess={handleUploadSuccess}
            onNavigateToChat={(docId) => {
              setSelectedDocId(docId);
              setActiveTab('chat');
            }}
          />
        )}

        {activeTab === 'dashboard' && (
          <DocumentDashboard
            user={user}
            onOpenAuth={() => openAuthModal('login')}
            documents={documents}
            selectedDocId={selectedDocId}
            onSelectDoc={(id) => setSelectedDocId(id)}
            onDeleteDoc={handleDeleteDocument}
            onNavigateToUpload={() => setActiveTab('upload')}
            onNavigateToChat={(id) => {
              if (id) setSelectedDocId(id);
              setActiveTab('chat');
            }}
          />
        )}

        {activeTab === 'chat' && (
          <ChatScreen
            user={user}
            onOpenAuth={() => openAuthModal('login')}
            documents={documents}
            selectedDocId={selectedDocId}
            setSelectedDocId={setSelectedDocId}
            onOpenSourceViewer={handleOpenSourceViewer}
            onDeleteDoc={handleDeleteDocument}
          />
        )}
      </main>

      {/* Authentication Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        initialMode={authInitialMode}
        onAuthSuccess={handleAuthSuccess}
      />

      {/* Slide-over Source Viewer Drawer */}
      <SourceViewer
        isOpen={sourceViewerData.isOpen}
        onClose={() => setSourceViewerData(prev => ({ ...prev, isOpen: false }))}
        citationData={sourceViewerData.citation}
        document={sourceViewerData.doc}
      />

      {/* Global Toast Notification */}
      {toast && (
        <ToastNotification
          type={toast.type}
          message={toast.message}
          onClose={() => setToast(null)}
        />
      )}

    </div>
  );
}
