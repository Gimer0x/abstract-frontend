import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSubscription } from '../context/SubscriptionContext';
import { toast } from 'react-toastify';
import axios from 'axios';
import './DocumentHistory.css';

const DocumentHistory = () => {
  const { user } = useAuth();
  const { usage, getRemainingDocuments } = useSubscription();
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [downloading, setDownloading] = useState({});

  useEffect(() => {
    if (user) {
      fetchDocuments();
    }
  }, [user]);

  // Listen for reload event from start over button
  useEffect(() => {
    const handleReload = () => {
      if (user) {
        fetchDocuments();
      }
    };

    window.addEventListener('reloadDocumentHistory', handleReload);
    return () => {
      window.removeEventListener('reloadDocumentHistory', handleReload);
    };
  }, [user]);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(`${process.env.REACT_APP_API_URL || 'http://localhost:5001'}/api/documents`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      setDocuments(response.data);
    } catch (error) {
      console.error('Error fetching documents:', error);
      setError('Failed to load document history');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getFileTypeIcon = (fileType) => {
    const icons = {
      '.pdf': '📄',
      '.txt': '📝',
      '.docx': '📘',
      '.rtf': '📄',
      '.odt': '📄'
    };
    return icons[fileType] || '📄';
  };

  const getSummarySizeLabel = (size) => {
    const labels = {
      short: 'Short',
      medium: 'Medium',
      long: 'Long'
    };
    return labels[size] || size;
  };

  const handleDownload = async (doc, format) => {
    if (!user) return;

    const docId = doc._id;
    setDownloading(prev => ({ ...prev, [docId]: true }));

    try {
      console.log('Downloading document:', { 
        docId, 
        format, 
        filename: doc.originalFilename,
        hasSummary: !!doc.summary 
      });

      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL || 'http://localhost:5001'}/api/export/${format}`,
        {
          summaryData: doc.summary,
          originalFilename: doc.originalFilename,
          summarySize: doc.summarySize
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          responseType: 'blob'
        }
      );

      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `summary-${doc.originalFilename.replace(/\.[^/.]+$/, '')}.${format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      toast.success(`${format.toUpperCase()} download started!`);
    } catch (error) {
      console.error('Download error:', error);
      
      let errorMessage = 'Failed to download document';
      
      if (error.response) {
        // Server responded with error
        if (error.response.data instanceof Blob) {
          // Try to read the blob as text to get error details
          const reader = new FileReader();
          reader.onload = () => {
            try {
              const errorData = JSON.parse(reader.result);
              toast.error(errorData.error || errorMessage);
            } catch {
              toast.error(errorMessage);
            }
          };
          reader.readAsText(error.response.data);
        } else {
          errorMessage = error.response.data.error || errorMessage;
          if (error.response.data.details) {
            errorMessage += `: ${error.response.data.details}`;
          }
          toast.error(errorMessage);
        }
      } else if (error.request) {
        // Network error
        toast.error('Network error. Please check your connection.');
      } else {
        // Other error
        toast.error(error.message || errorMessage);
      }
    } finally {
      setDownloading(prev => ({ ...prev, [docId]: false }));
    }
  };

  if (!user) return null;

  if (loading) {
    return (
      <div className="document-history">
        <h3>Document History</h3>
        <div className="loading">Loading your documents...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="document-history">
        <h3>Document History</h3>
        <div className="error">{error}</div>
      </div>
    );
  }

  return (
    <div className="document-history">
      <div className="history-header">
        <h3>Document History</h3>
        <div className="document-stats">
          <span>Documents: {usage?.documentCount || documents.length}</span>
          <span>Remaining: {getRemainingDocuments() || 'N/A'}</span>
        </div>
      </div>
      {documents.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📄</div>
          <p>No documents processed yet</p>
          <span>Your processed documents will appear here</span>
        </div>
      ) : (
        <div className="documents-list">
          {documents.map((doc) => (
            <div key={doc._id} className="document-item">
              <div className="document-icon">
                {getFileTypeIcon(doc.fileType)}
              </div>
              <div className="document-info">
                <div className="document-name">{doc.originalFilename}</div>
                <div className="document-meta">
                  <span className="summary-size">{getSummarySizeLabel(doc.summarySize)} summary</span>
                  <span className="document-date">{formatDate(doc.createdAt)}</span>
                </div>
              </div>
              <div className="document-actions">
                <div className="download-options">
                  <button
                    className={`download-btn ${downloading[doc._id] ? 'downloading' : ''}`}
                    onClick={() => handleDownload(doc, 'pdf')}
                    disabled={downloading[doc._id]}
                    title="Download as PDF"
                  >
                    {downloading[doc._id] ? '⏳' : '📄'} PDF
                  </button>
                  <button
                    className={`download-btn ${downloading[doc._id] ? 'downloading' : ''}`}
                    onClick={() => handleDownload(doc, 'docx')}
                    disabled={downloading[doc._id]}
                    title="Download as Word"
                  >
                    {downloading[doc._id] ? '⏳' : '📘'} Word
                  </button>
                  <button
                    className={`download-btn ${downloading[doc._id] ? 'downloading' : ''}`}
                    onClick={() => handleDownload(doc, 'txt')}
                    disabled={downloading[doc._id]}
                    title="Download as Text"
                  >
                    {downloading[doc._id] ? '⏳' : '📝'} TXT
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DocumentHistory; 