import { useEffect, useState } from 'react';
import './PhotoProgress.css';

const PhotoProgress = ({ batchId, onComplete, onError }) => {
  const [status, setStatus] = useState(null);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!batchId) return;

    const checkStatus = async () => {
      try {
        const API_BASE_URL =
          process.env.REACT_APP_API_URL || 'http://localhost:5001';
        const token = localStorage.getItem('token');

        const response = await fetch(
          `${API_BASE_URL}/api/photos/status/${batchId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error('Failed to check status');
        }

        const data = await response.json();
        setStatus(data);

        // Calculate progress percentage
        const total = data.total;
        const completed = data.completed;
        const failed = data.failed;
        const progressPercent = ((completed + failed) / total) * 100;
        setProgress(progressPercent);

        // Check if processing is complete
        if (data.completed + data.failed === data.total) {
          if (data.failed === data.total) {
            // All failed
            setError('All photos failed to process');
            onError && onError('All photos failed to process');
          } else {
            // Some or all completed
            onComplete && onComplete(data);
          }
        } else {
          // Still processing, check again in 2 seconds
          setTimeout(checkStatus, 2000);
        }
      } catch (err) {
        console.error('Error checking photo status:', err);
        setError('Failed to check processing status');
        onError && onError('Failed to check processing status');
      }
    };

    // Start checking status
    checkStatus();

    // Cleanup function
    return () => {
      // Clear any pending timeouts if component unmounts
    };
  }, [batchId, onComplete, onError]);

  if (!status) {
    return (
      <div className='photo-progress-container'>
        <div className='progress-loading'>
          <div className='spinner'></div>
          <p>Initializing photo processing...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className='photo-progress-container'>
        <div className='progress-error'>
          <div className='error-icon'>❌</div>
          <h3>Processing Error</h3>
          <p>{error}</p>
          <button
            onClick={() => window.location.reload()}
            className='retry-button'
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className='photo-progress-container'>
      <div className='progress-header'>
        <h3>Processing Photos</h3>
        <p>Extracting text and generating descriptions...</p>
      </div>

      <div className='progress-stats'>
        <div className='stat-item'>
          <span className='stat-number'>{status.total}</span>
          <span className='stat-label'>Total</span>
        </div>
        <div className='stat-item completed'>
          <span className='stat-number'>{status.completed}</span>
          <span className='stat-label'>Completed</span>
        </div>
        <div className='stat-item processing'>
          <span className='stat-number'>{status.processing}</span>
          <span className='stat-label'>Processing</span>
        </div>
        <div className='stat-item failed'>
          <span className='stat-number'>{status.failed}</span>
          <span className='stat-label'>Failed</span>
        </div>
      </div>

      <div className='progress-bar-container'>
        <div className='progress-bar'>
          <div
            className='progress-fill'
            style={{ width: `${progress}%` }}
          >
          </div>
        </div>
        <span className='progress-text'>{Math.round(progress)}%</span>
      </div>

      <div className='progress-details'>
        <h4>Processing Details</h4>
        <div className='photo-list'>
          {status.photos.map((photo, index) => (
            <div
              key={photo._id}
              className={`photo-item ${photo.processingStatus}`}
            >
              <div className='photo-status'>
                {photo.processingStatus === 'completed' && (
                  <span className='status-icon'>✅</span>
                )}
                {photo.processingStatus === 'processing' && (
                  <span className='status-icon'>⏳</span>
                )}
                {photo.processingStatus === 'failed' && (
                  <span className='status-icon'>❌</span>
                )}
                {photo.processingStatus === 'pending' && (
                  <span className='status-icon'>⏸️</span>
                )}
              </div>
              <div className='photo-info'>
                <p className='photo-name'>{photo.originalFilename}</p>
                <p className='photo-size'>
                  {(photo.fileSize / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
              {photo.errorMessage && (
                <div className='photo-error'>
                  <p>{photo.errorMessage}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {progress === 100 && (
        <div className='progress-complete'>
          <div className='complete-icon'>🎉</div>
          <h3>Processing Complete!</h3>
          <p>All photos have been processed successfully.</p>
        </div>
      )}
    </div>
  );
};

export default PhotoProgress;
