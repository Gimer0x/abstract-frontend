import React from 'react';
import axios from 'axios';
import './ExportOptions.css';

const ExportOptions = ({ 
  summaryData, 
  originalFilename, 
  summarySize,
  onExportStart, 
  onExportComplete, 
  onExportError, 
  isExporting,
  isGuest = false // New prop to identify guest users
}) => {
  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001';

  const handleExport = async (format) => {
    onExportStart();
    
    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/export/${format}`,
        {
          summaryData,
          originalFilename,
          summarySize
        },
        {
          responseType: format === 'txt' ? 'text' : 'blob',
          timeout: 30000, // 30 seconds timeout
        }
      );

      // Create download link
      const url = window.URL.createObjectURL(
        format === 'txt' 
          ? new Blob([response.data], { type: 'text/plain' })
          : response.data
      );
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `summary-${originalFilename.replace(/\.[^/.]+$/, '')}.${format}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      onExportComplete();
    } catch (error) {
      console.error(`Export ${format} error:`, error);
      
      let errorMessage = `Error exporting to ${format.toUpperCase()}`;
      
      if (error.response) {
        errorMessage = error.response.data?.error || errorMessage;
      } else if (error.request) {
        errorMessage = 'Network error. Please check your connection.';
      } else {
        errorMessage = error.message || errorMessage;
      }
      
      onExportError({ message: errorMessage });
    }
  };

  const exportOptions = [
    {
      format: 'pdf',
      label: 'PDF',
      icon: '📄',
      description: 'Professional PDF format',
      color: '#dc3545'
    },
    {
      format: 'docx',
      label: 'Word',
      icon: '📝',
      description: 'Microsoft Word document',
      color: '#007bff'
    },
    {
      format: 'txt',
      label: 'Text',
      icon: '📄',
      description: 'Plain text format',
      color: '#6c757d'
    }
  ];

  // If user is a guest, show sign-in prompt instead of export buttons
  if (isGuest) {
    return (
      <div className="export-options">
        <div className="export-header">
          <h3>Export Summary</h3>
          <p>Sign in to download your summaries in multiple formats</p>
        </div>

        <div className="guest-export-message">
          <div className="guest-icon">🔒</div>
          <div className="guest-content">
            <h4>Sign in to Export</h4>
            <p>Guest users can copy the summary text, but need to sign in to download documents in PDF, Word, or Text formats.</p>
            <div className="guest-benefits">
              <div className="benefit-item">
                <span className="benefit-icon">📄</span>
                <span>Export to PDF, Word, and Text</span>
              </div>
              <div className="benefit-item">
                <span className="benefit-icon">📚</span>
                <span>Save document history</span>
              </div>
              <div className="benefit-item">
                <span className="benefit-icon">📊</span>
                <span>Access medium and long summaries</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="export-options">
      <div className="export-header">
        <h3>Export Summary</h3>
        <p>Choose your preferred format to download the summary</p>
      </div>

      <div className="export-buttons">
        {exportOptions.map((option) => (
          <button
            key={option.format}
            className={`export-button ${isExporting ? 'disabled' : ''}`}
            onClick={() => handleExport(option.format)}
            disabled={isExporting}
            style={{ '--button-color': option.color }}
          >
            <div className="export-icon">{option.icon}</div>
            <div className="export-info">
              <span className="export-label">{option.label}</span>
              <span className="export-description">{option.description}</span>
            </div>
            {isExporting && <div className="export-spinner"></div>}
          </button>
        ))}
      </div>

      {isExporting && (
        <div className="export-status">
          <p>Preparing your export...</p>
        </div>
      )}
    </div>
  );
};

export default ExportOptions; 