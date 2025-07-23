import React, { useState, useCallback } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './App.css';
import DocumentUpload from './components/DocumentUpload';
import SummaryDisplay from './components/SummaryDisplay';
import ExportOptions from './components/ExportOptions';

function App() {
  const [summaryData, setSummaryData] = useState(null);
  const [originalFilename, setOriginalFilename] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const handleDocumentProcessed = useCallback((data) => {
    setSummaryData(data.summary);
    setOriginalFilename(data.originalFilename);
    toast.success('Document processed successfully!');
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

  return (
    <div className="App">
      <header className="App-header">
        <h1>Document Summarizer</h1>
        <p>Upload a document to get an AI-powered summary and key insights</p>
      </header>

      <main className="App-main">
        <DocumentUpload
          onDocumentProcessed={handleDocumentProcessed}
          onProcessingError={handleProcessingError}
          isProcessing={isProcessing}
          setIsProcessing={setIsProcessing}
        />

        {summaryData && (
          <>
            <SummaryDisplay 
              summaryData={summaryData} 
              originalFilename={originalFilename}
            />
            
            <ExportOptions
              summaryData={summaryData}
              originalFilename={originalFilename}
              onExportStart={handleExportStart}
              onExportComplete={handleExportComplete}
              onExportError={handleExportError}
              isExporting={isExporting}
            />
          </>
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

export default App;
