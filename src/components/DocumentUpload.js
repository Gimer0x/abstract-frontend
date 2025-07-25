import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useSubscription } from '../context/SubscriptionContext';
import UpgradePrompt from './UpgradePrompt';
import './DocumentUpload.css';

const DocumentUpload = ({ onDocumentProcessed, onProcessingError, isProcessing, setIsProcessing, summarySize, onNavigateToPricing }) => {
  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001';
  const { user, isAuthenticated } = useAuth();
  const { canUploadMore } = useSubscription();
  const [showUpgradePrompt, setShowUpgradePrompt] = useState(false);

  const onDrop = useCallback(async (acceptedFiles) => {
    if (acceptedFiles.length === 0) return;

    const file = acceptedFiles[0];
    
    // Debug logging

    
    // Check if user can upload more documents (only for authenticated users)
    if (isAuthenticated && !canUploadMore()) {
      console.log('DocumentUpload - User has exceeded limit, showing upgrade prompt');
      setShowUpgradePrompt(true);
      return;
    }
    
    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      onProcessingError({ message: 'File size must be less than 5MB' });
      return;
    }

    // Validate file type
    const allowedTypes = ['.pdf', '.txt', '.docx', '.rtf', '.odt'];
    const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));
    
    if (!allowedTypes.includes(fileExtension)) {
      onProcessingError({ 
        message: 'Invalid file type. Please upload PDF, TXT, DOCX, RTF, or ODT files.' 
      });
      return;
    }

    setIsProcessing(true);

    try {
      const formData = new FormData();
      formData.append('document', file);
      formData.append('summarySize', summarySize);

      // Use different endpoints based on authentication status
      const endpoint = isAuthenticated ? '/api/process-document' : '/api/process-document-guest';
      
      const config = {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 120000, // 2 minutes timeout
      };

      // Add authorization header for authenticated users
      if (isAuthenticated) {
        config.headers['Authorization'] = `Bearer ${localStorage.getItem('token')}`;
      }

      const response = await axios.post(`${API_BASE_URL}${endpoint}`, formData, config);

      if (response.data.success) {
        onDocumentProcessed(response.data);
      } else {
        onProcessingError({ message: 'Failed to process document' });
      }
    } catch (error) {
      console.error('Upload error:', error);
      
      let errorMessage = 'Error processing document';
      
      if (error.response) {
        // Server responded with error
        const responseData = error.response.data;
        errorMessage = responseData.error || errorMessage;
        
        // Handle limit exceeded errors
        if (responseData.reason === 'document_limit' || responseData.reason === 'page_limit') {
          setShowUpgradePrompt(true);
          return; // Don't show error toast, show upgrade prompt instead
        }
        
        if (responseData.details) {
          errorMessage += `: ${responseData.details}`;
        }
      } else if (error.request) {
        // Network error
        errorMessage = 'Network error. Please check your connection.';
      } else {
        // Other error
        errorMessage = error.message || errorMessage;
      }
      
      onProcessingError({ message: errorMessage });
    } finally {
      setIsProcessing(false);
    }
  }, [onDocumentProcessed, onProcessingError, setIsProcessing, API_BASE_URL, summarySize, canUploadMore, isAuthenticated, user]);

  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'text/plain': ['.txt'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'application/rtf': ['.rtf'],
      'application/vnd.oasis.opendocument.text': ['.odt']
    },
    multiple: false,
    disabled: isProcessing
  });

  return (
    <div className="document-upload">
      <div 
        {...getRootProps()} 
        className={`dropzone ${isDragActive ? 'active' : ''} ${isDragReject ? 'reject' : ''} ${isProcessing ? 'processing' : ''}`}
      >
        <input {...getInputProps()} />
        
        {isProcessing ? (
          <div className="upload-content processing">
            <div className="spinner"></div>
            <p>Processing your document...</p>
            <p className="processing-note">This may take a few moments</p>
          </div>
        ) : (
          <div className="upload-content">
            {isDragActive ? (
              <div>
                <i className="upload-icon">📄</i>
                <p>Drop your document here</p>
              </div>
            ) : (
              <div>
                <i className="upload-icon">📁</i>
                <h3>Upload a Document</h3>
                <p>Drag and drop a file here, or click to select</p>
                <p className="file-types">
                  Supported formats: PDF, TXT, DOCX, RTF, ODT
                </p>
                <p className="file-size">
                  Maximum file size: 5MB
                </p>
                {!isAuthenticated && (
                  <p className="guest-limit">
                    ⚠️ Guest users: Maximum 2 pages per document
                  </p>
                )}
              </div>
            )}
          </div>
        )}
      </div>
      
      <UpgradePrompt
        type="limit"
        show={showUpgradePrompt}
        onClose={() => setShowUpgradePrompt(false)}
        onUpgrade={() => {
          setShowUpgradePrompt(false);
          if (onNavigateToPricing) {
            onNavigateToPricing();
          }
        }}
      />
    </div>
  );
};

export default DocumentUpload; 