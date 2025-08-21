import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSubscription } from '../context/SubscriptionContext';
import PhotoUpload from '../components/PhotoUpload';
import PhotoProgress from '../components/PhotoProgress';
import PhotoResults from '../components/PhotoResults';
import PhotoHistory from '../components/PhotoHistory';
import './BulkPhotos.css';

const BulkPhotos = () => {
  const { isAuthenticated } = useAuth();
  const { subscription } = useSubscription();
  const [currentStep, setCurrentStep] = useState('upload'); // upload, processing, results
  const [selectedPhotos, setSelectedPhotos] = useState([]);
  const [batchId, setBatchId] = useState(null);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);

  const isProUser = isAuthenticated && subscription?.plan === 'pro';

  const handlePhotosSelected = async photos => {
    setSelectedPhotos(photos);

    // Automatically start processing when photos are selected
    if (photos.length > 0) {
      await handleUpload(photos);
    }
  };

  const handleUpload = async (photos = selectedPhotos) => {
    if (photos.length === 0) {
      setError('Please select at least one photo');
      return;
    }

    setError(null);
    setCurrentStep('processing');

    try {
      const formData = new FormData();
      photos.forEach(photo => {
        formData.append('photos', photo);
      });

      const API_BASE_URL =
        process.env.REACT_APP_API_URL || 'http://localhost:5001';
      const token = localStorage.getItem('token');

      if (!token) {
        throw new Error('Please log in to use this feature');
      }

      const response = await fetch(`${API_BASE_URL}/api/process-photos`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to upload photos');
      }

      const data = await response.json();
      setBatchId(data.batchId);
    } catch (err) {
      console.error('Upload error:', err);
      setError(err.message);
      setCurrentStep('upload');
    }
  };

  const handleProcessingComplete = async statusData => {
    try {
      // Get the final results
      const API_BASE_URL =
        process.env.REACT_APP_API_URL || 'http://localhost:5001';
      const token = localStorage.getItem('token');

      const response = await fetch(
        `${API_BASE_URL}/api/photos/results/${batchId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (!response.ok) {
        throw new Error('Failed to get results');
      }

      const resultsData = await response.json();
      setResults(resultsData);
      setCurrentStep('results');
    } catch (err) {
      console.error('Results error:', err);
      setError('Failed to get processing results');
      setCurrentStep('upload');
    }
  };

  const handleProcessingError = errorMessage => {
    setError(errorMessage);
    setCurrentStep('upload');
  };

  const handleReset = () => {
    setCurrentStep('upload');
    setSelectedPhotos([]);
    setBatchId(null);
    setResults(null);
    setError(null);
  };

  const renderStep = () => {
    switch (currentStep) {
      case 'upload':
        return (
          <PhotoUpload
            onPhotosSelected={handlePhotosSelected}
            isProcessing={currentStep === 'processing'}
            isProUser={isProUser}
          />
        );

      case 'processing':
        return (
          <PhotoProgress
            batchId={batchId}
            onComplete={handleProcessingComplete}
            onError={handleProcessingError}
          />
        );

      default:
        return null;
    }
  };

  // Show login prompt if not authenticated
  if (!isAuthenticated) {
    return (
      <div className='bulk-photos-page'>
        <div className='page-header'>
          <h1>Photo to Text</h1>
          <p>
            Upload photos to extract text and generate AI-powered descriptions
          </p>
        </div>
        <div className='login-prompt'>
          <div className='login-prompt-content'>
            <h3>🔐 Authentication Required</h3>
            <p>Please log in to use the Photo to Text feature.</p>
            <button
              className='login-button'
              onClick={() => window.location.reload()}
            >
              Login with Google
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='bulk-photos-page'>
      <div className='page-header'>
        <h1>Photo to Text</h1>
        <p>
          Upload photos to extract text and generate AI-powered descriptions
        </p>
      </div>

      {error && (
        <div className='error-banner'>
          <div className='error-content'>
            <span className='error-icon'>⚠️</span>
            <span className='error-message'>{error}</span>
            <button onClick={() => setError(null)} className='error-close'>
              ×
            </button>
          </div>
        </div>
      )}

      {currentStep === 'results' ? (
        // Full page results view
        <div className='results-full-page'>
          <PhotoResults results={results} onReset={handleReset} />
        </div>
      ) : (
        // Normal layout for upload and processing
        <div className='page-layout'>
          <div className='main-content'>
            <div className='page-content'>{renderStep()}</div>
          </div>

          <div className='sidebar'>
            <PhotoHistory />
          </div>
        </div>
      )}
    </div>
  );
};

export default BulkPhotos;
