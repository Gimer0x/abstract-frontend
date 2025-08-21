import { useState, useEffect } from 'react';
import './PhotoResults.css';

const PhotoResults = ({ results, onReset }) => {
  const [isExporting, setIsExporting] = useState(false);
  const [exportFormat, setExportFormat] = useState('');

  const handleExport = async format => {
    setIsExporting(true);
    setExportFormat(format);

    try {
      const API_BASE_URL =
        process.env.REACT_APP_API_URL || 'http://localhost:5001';
      const token = localStorage.getItem('token');

      if (format === 'txt-text-only') {
        // Handle text-only export locally
        const textOnly = results.photos
          .filter(
            photo =>
              photo.processingStatus === 'completed' && photo.extractedText,
          )
          .map(photo => photo.extractedText)
          .join('\n\n');

        const blob = new Blob([textOnly], { type: 'text/plain' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `photo-text-only-${results.batchId}.txt`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        const response = await fetch(
          `${API_BASE_URL}/api/photos/export/${format}`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              batchId: results.batchId,
            }),
          },
        );

        if (!response.ok) {
          throw new Error('Export failed');
        }

        // Get the blob from the response
        const blob = await response.blob();

        // Create download link
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        const extension = format === 'rtf' ? 'rtf' : format;
        a.download = `photo-ocr-${results.batchId}.${extension}`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (error) {
      console.error('Export error:', error);
      alert('Export failed. Please try again.');
    } finally {
      setIsExporting(false);
      setExportFormat('');
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(results.organizedText);
      alert('Text copied to clipboard!');
    } catch (error) {
      console.error('Copy failed:', error);
      alert('Failed to copy text. Please select and copy manually.');
    }
  };

  useEffect(() => {
    if (results) {
      // Trigger photo history reload when results are shown
      window.dispatchEvent(new Event('reloadPhotoHistory'));
    }
  }, [results]);

  return (
    <div className='photo-results-container'>
      <div className='results-header'>
        <div className='results-header-top'>
          <button onClick={onReset} className='back-button'>
            ← Back to Upload
          </button>
          <h3>Photo OCR Results</h3>
        </div>
        <p>Text extracted and organized from {results.totalPhotos} photos</p>
      </div>

      {/* Summary Stats */}
      <div className='results-summary'>
        <div className='summary-item'>
          <span className='summary-number'>{results.totalPhotos}</span>
          <span className='summary-label'>Photos Processed</span>
        </div>
        <div className='summary-item'>
          <span className='summary-number'>
            {
              results.photos.filter(p => p.processingStatus === 'completed')
                .length
            }
          </span>
          <span className='summary-label'>Successful</span>
        </div>
        <div className='summary-item'>
          <span className='summary-number'>
            {results.photos.filter(p => p.processingStatus === 'failed').length}
          </span>
          <span className='summary-label'>Failed</span>
        </div>
      </div>

      {/* Export Options */}
      <div className='export-options'>
        <h4>Export Options</h4>
        <div className='export-buttons'>
          <button
            onClick={() => handleExport('pdf')}
            disabled={isExporting}
            className={`export-btn ${exportFormat === 'pdf' ? 'exporting' : ''}`}
          >
            {isExporting && exportFormat === 'pdf'
              ? 'Exporting...'
              : 'Export as PDF'}
          </button>
          <button
            onClick={() => handleExport('docx')}
            disabled={isExporting}
            className={`export-btn ${exportFormat === 'docx' ? 'exporting' : ''}`}
          >
            {isExporting && exportFormat === 'docx'
              ? 'Exporting...'
              : 'Export as DOCX'}
          </button>
          <button
            onClick={() => handleExport('txt')}
            disabled={isExporting}
            className={`export-btn ${exportFormat === 'txt' ? 'exporting' : ''}`}
          >
            {isExporting && exportFormat === 'txt'
              ? 'Exporting...'
              : 'Export as TXT'}
          </button>
          <button
            onClick={() => handleExport('rtf')}
            disabled={isExporting}
            className={`export-btn ${exportFormat === 'rtf' ? 'exporting' : ''}`}
          >
            {isExporting && exportFormat === 'rtf'
              ? 'Exporting...'
              : 'Export as RTF'}
          </button>
          <button
            onClick={() => handleExport('txt-text-only')}
            disabled={isExporting}
            className={`export-btn ${exportFormat === 'txt-text-only' ? 'exporting' : ''}`}
          >
            {isExporting && exportFormat === 'txt-text-only'
              ? 'Exporting...'
              : 'Export Text Only'}
          </button>
          <button
            onClick={copyToClipboard}
            disabled={isExporting}
            className='export-btn copy-btn'
          >
            Copy to Clipboard
          </button>
        </div>
      </div>

      {/* Extracted Text */}
      <div className='organized-text-section'>
        <div className='text-header'>
          <h4>Extracted Text</h4>
          <p>Text content from all images containing text</p>
        </div>
        <div className='text-content'>
          <pre>{results.organizedText}</pre>
        </div>
      </div>

      {/* Action Buttons */}
      <div className='results-actions'>
        <button onClick={onReset} className='reset-button'>
          Process New Photos
        </button>
      </div>
    </div>
  );
};

export default PhotoResults;
