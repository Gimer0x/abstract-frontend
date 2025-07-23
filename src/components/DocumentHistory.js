import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import './DocumentHistory.css';

const DocumentHistory = () => {
  const { user } = useAuth();
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (user) {
      fetchDocuments();
    }
  }, [user]);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${process.env.REACT_APP_API_URL || 'http://localhost:5001'}/api/documents`);
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
      <h3>Document History</h3>
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
              <div className="document-summary">
                {doc.summary.executiveSummary && doc.summary.executiveSummary.length > 100 
                  ? `${doc.summary.executiveSummary.substring(0, 100)}...` 
                  : doc.summary.executiveSummary || 'Summary not available'
                }
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DocumentHistory; 