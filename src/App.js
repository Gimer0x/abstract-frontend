import React, { useState, useCallback, useEffect } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './App.css';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SubscriptionProvider } from './context/SubscriptionContext';
import DocumentUpload from './components/DocumentUpload';
import SummaryDisplay from './components/SummaryDisplay';
import ExportOptions from './components/ExportOptions';
import SummarySizeSelector from './components/SummarySizeSelector';
import LoginButton from './components/LoginButton';
import UserProfile from './components/UserProfile';
import DocumentHistory from './components/DocumentHistory';
import Pricing from './components/Pricing';

function AppContent() {
  const { user, loading, login } = useAuth();
  const [summaryData, setSummaryData] = useState(null);
  const [originalFilename, setOriginalFilename] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [summarySize, setSummarySize] = useState('short');
  const [showLogin, setShowLogin] = useState(false);
  const [currentPage, setCurrentPage] = useState('main');

  // Check for auth callback on mount
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    
    if (token) {
      login(token);
      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [login]);

  const handleDocumentProcessed = useCallback((data) => {
    setSummaryData(data.summary);
    setOriginalFilename(data.originalFilename);
    
    if (data.requiresAuth) {
      toast.warning('Sign in to access medium and long summaries!');
    } else {
      toast.success('Document processed successfully!');
    }
  }, []);

  const handleProcessingError = useCallback((error) => {
    toast.error(error.message || 'Error processing document');
    setIsProcessing(false);
  }, []);

  const handleExportStart = useCallback(() => {
    setIsExporting(true);
  }, []);

  const handleExportComplete = useCallback(() => {
    setIsExporting(false);
    toast.success('Export completed successfully!');
  }, []);

  const handleExportError = useCallback((error) => {
    setIsExporting(false);
    toast.error(error.message || 'Error exporting document');
  }, []);

  const handleGuestLogin = () => {
    setShowLogin(false);
    toast.info('Continuing as guest. You can only generate short summaries.');
  };

  if (loading) {
    return (
      <div className="App">
        <div className="loading-screen">
          <div className="loading-spinner"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (showLogin && !user) {
    return (
      <div className="App">
        <LoginButton onLogin={handleGuestLogin} />
      </div>
    );
  }

  return (
    <div className="App">
      <header className="App-header">
        <div className="header-content">
          <div className="header-left">
            <h1>Document Summarizer</h1>
            <p>Upload a document to get an AI-powered summary and key insights</p>
          </div>
          <div className="header-right">
            <nav className="header-nav">
              <button 
                className={`nav-btn ${currentPage === 'main' ? 'active' : ''}`}
                onClick={() => setCurrentPage('main')}
              >
                Home
              </button>
              <button 
                className={`nav-btn ${currentPage === 'pricing' ? 'active' : ''}`}
                onClick={() => setCurrentPage('pricing')}
              >
                Pricing
              </button>
            </nav>
            {user ? (
              <UserProfile />
            ) : (
              <button 
                className="sign-in-btn"
                onClick={() => setShowLogin(true)}
              >
                Sign In
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="App-main">
        {currentPage === 'main' ? (
          <div className="main-content">
            <div className="upload-section">
              <SummarySizeSelector
                selectedSize={summarySize}
                onSizeChange={setSummarySize}
                isProcessing={isProcessing}
                isAuthenticated={!!user}
              />
              
              <DocumentUpload
                onDocumentProcessed={handleDocumentProcessed}
                onProcessingError={handleProcessingError}
                isProcessing={isProcessing}
                setIsProcessing={setIsProcessing}
                summarySize={summarySize}
                isAuthenticated={!!user}
              />

              {summaryData && (
                <>
                  <SummaryDisplay 
                    summaryData={summaryData} 
                    originalFilename={originalFilename}
                    summarySize={summarySize}
                  />
                  
                  <ExportOptions
                    summaryData={summaryData}
                    originalFilename={originalFilename}
                    summarySize={summarySize}
                    onExportStart={handleExportStart}
                    onExportComplete={handleExportComplete}
                    onExportError={handleExportError}
                    isExporting={isExporting}
                  />
                </>
              )}
            </div>

            {user && (
              <div className="history-section">
                <DocumentHistory />
              </div>
            )}
          </div>
        ) : (
          <Pricing />
        )}
      </main>

      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <SubscriptionProvider>
        <AppContent />
      </SubscriptionProvider>
    </AuthProvider>
  );
}

export default App;
