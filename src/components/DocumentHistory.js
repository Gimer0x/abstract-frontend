import React, { useState, useEffect, useCallback } from 'react';
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
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [downloading, setDownloading] = useState({});
  const [previousDocCount, setPreviousDocCount] = useState(0);
  const [newlyAddedDocs, setNewlyAddedDocs] = useState(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const documentsPerPage = 4;

  const fetchDocuments = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(`${process.env.REACT_APP_API_URL || 'http://localhost:5001'}/api/documents`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      // Check if new documents were added
      const newDocCount = response.data.length;
      const hasNewDocuments = newDocCount > previousDocCount && previousDocCount > 0;
      
      // Identify newly added documents
      if (hasNewDocuments && refreshing) {
        const existingDocIds = new Set(documents.map(doc => doc._id));
        const newDocIds = response.data
          .filter(doc => !existingDocIds.has(doc._id))
          .map(doc => doc._id);
        
        setNewlyAddedDocs(new Set(newDocIds));
        
        // Remove highlight after 3 seconds
        setTimeout(() => {
          setNewlyAddedDocs(new Set());
        }, 3000);
        
        const newCount = newDocCount - previousDocCount;
        toast.success(`${newCount} new document${newCount > 1 ? 's' : ''} added to history!`);
      }
      
      setDocuments(response.data);
      setPreviousDocCount(newDocCount);
    } catch (error) {
      console.error('Error fetching documents:', error);
      setError('Failed to load document history');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user) {
      fetchDocuments();
    }
  }, [user]);

  // Listen for reload event from start over button
  useEffect(() => {
    const handleReload = () => {
      if (user) {
        setRefreshing(true);
        setCurrentPage(1); // Reset to first page when reloading
        fetchDocuments().finally(() => {
          setRefreshing(false);
        });
      }
    };

    window.addEventListener('reloadDocumentHistory', handleReload);
    return () => {
      window.removeEventListener('reloadDocumentHistory', handleReload);
    };
  }, [user]);

  // Pagination calculations
  const totalPages = Math.ceil(documents.length / documentsPerPage);
  const startIndex = (currentPage - 1) * documentsPerPage;
  const endIndex = startIndex + documentsPerPage;
  const currentDocuments = documents.slice(startIndex, endIndex);

  // Navigation functions
  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
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

    // Show specific message for MP3 processing at the start
    if (format === 'mp3') {
      toast.info('Audio file is being processed and will download shortly!');
    }

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
      
      // Show success message
      if (format === 'mp3') {
        toast.success('Audio file download started!');
      } else {
        toast.success(`${format.toUpperCase()} download started!`);
      }
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
        {refreshing && <span className="refreshing-indicator">🔄 Updating...</span>}
        <div className="document-stats">
          <span>Documents: {usage?.documentCount || documents.length}</span>
          <span>Remaining: {getRemainingDocuments() || 'N/A'}</span>
          {documents.length > documentsPerPage && (
            <span>Showing: {startIndex + 1}-{Math.min(endIndex, documents.length)}</span>
          )}
        </div>
        {documents.length > documentsPerPage && (
          <div className="pagination-controls">
            <button 
              className="pagination-btn" 
              onClick={goToPreviousPage}
              disabled={currentPage === 1}
              title="Previous page"
            >
              ←
            </button>
            <span className="page-info">
              Page {currentPage} of {totalPages}
            </span>
            <button 
              className="pagination-btn" 
              onClick={goToNextPage}
              disabled={currentPage === totalPages}
              title="Next page"
            >
              →
            </button>
          </div>
        )}
      </div>
      {documents.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📄</div>
          <p>No documents processed yet</p>
          <span>Your processed documents will appear here</span>
        </div>
      ) : (
        <div className="documents-list">
          {currentDocuments.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📄</div>
              <p>No documents on this page</p>
              <span>Try navigating to another page</span>
            </div>
          ) : (
            currentDocuments.map((doc) => (
              <div 
                key={doc._id} 
                className={`document-item ${newlyAddedDocs.has(doc._id) ? 'newly-added' : ''}`}
              >
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
                    <button
                      className={`download-btn download-btn-audio ${downloading[doc._id] ? 'downloading' : ''}`}
                      onClick={() => handleDownload(doc, 'mp3')}
                      disabled={downloading[doc._id]}
                      title="Download as Audio"
                    >
                      {downloading[doc._id] ? '⏳' : '🎵'} Audio
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default DocumentHistory; 