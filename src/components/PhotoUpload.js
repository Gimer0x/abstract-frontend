import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import './PhotoUpload.css';

const PhotoUpload = ({ onPhotosSelected, isProcessing, isProUser }) => {
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [errors, setErrors] = useState([]);
  const [showThumbnails, setShowThumbnails] = useState(false);

  const onDrop = useCallback((acceptedFiles, rejectedFiles) => {
    // Handle accepted files
    const newFiles = acceptedFiles.map(file => ({
      file: file,
      id: Math.random().toString(36).substr(2, 9),
      status: 'ready',
      preview: URL.createObjectURL(file),
    }));

    setUploadedFiles(prev => {
      const combined = [...prev, ...newFiles];
      // Limit to 50 files
      if (combined.length > 50) {
        // Use setTimeout to avoid setState during render
        setTimeout(
          () =>
            setErrors(['Maximum 50 photos allowed. Please remove some files.']),
          0,
        );
        return prev;
      }

      // Show thumbnails when files are added
      setShowThumbnails(true);

      return combined;
    });

    // Handle rejected files
    if (rejectedFiles.length > 0) {
      const newErrors = rejectedFiles.map(rejection => {
        if (rejection.errors[0]?.code === 'file-too-large') {
          return `${rejection.file.name}: File too large (max 10MB)`;
        } else if (rejection.errors[0]?.code === 'file-invalid-type') {
          return `${rejection.file.name}: Invalid file type (only JPG, PNG, WebP, HEIC)`;
        } else {
          return `${rejection.file.name}: ${rejection.errors[0]?.message}`;
        }
      });
      setErrors(prev => [...prev, ...newErrors]);
    }

    // Clear errors after 5 seconds
    setTimeout(() => setErrors([]), 5000);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
      'image/webp': ['.webp'],
      'image/heic': ['.heic'],
    },
    maxSize: 10 * 1024 * 1024, // 10MB
    maxFiles: 50,
    disabled: isProcessing || !isProUser,
  });

  const removeFile = fileId => {
    setUploadedFiles(prev => {
      const updated = prev.filter(f => f.id !== fileId);
      // Hide thumbnails if no files left
      if (updated.length === 0) {
        setShowThumbnails(false);
      }
      return updated;
    });
  };

  const handleStartProcessing = () => {
    if (uploadedFiles.length === 0) {
      setErrors(['Please select at least one photo']);
      return;
    }

    // Start processing the selected files
    onPhotosSelected(uploadedFiles.map(f => f.file));
  };

  const clearAll = () => {
    setUploadedFiles([]);
    setErrors([]);
    setShowThumbnails(false);
  };

  if (!isProUser) {
    return (
      <div className='photo-upload-container'>
        <div className='photo-upload-pro-prompt'>
          <div className='pro-badge'>
            <span className='premium-icon'>⭐</span>
            PRO FEATURE
          </div>
          <h3>Photo to Text</h3>
          <p>Upload photos and extract text using AI-powered OCR technology.</p>
          <ul>
            <li>✅ Extract text from images</li>
            <li>✅ Generate image descriptions</li>
            <li>✅ Process up to 50 photos at once</li>
            <li>✅ AI-powered text organization</li>
            <li>✅ Export to PDF, DOCX, TXT</li>
          </ul>
          <button className='upgrade-button'>Upgrade to Pro</button>
        </div>
      </div>
    );
  }

  return (
    <div className='photo-upload-container'>
      <div className='photo-upload-header'>
        <h3>Photo OCR & Text Extraction</h3>
        <p>
          Upload photos to automatically extract text and generate descriptions
        </p>
      </div>

      {/* Error Messages */}
      {errors.length > 0 && (
        <div className='photo-upload-errors'>
          {errors.map((error, index) => (
            <div key={index} className='error-message'>
              {error}
            </div>
          ))}
        </div>
      )}

      {/* Upload Area */}
      <div
        {...getRootProps()}
        className={`photo-upload-area ${isDragActive ? 'drag-active' : ''} ${isProcessing ? 'disabled' : ''}`}
      >
        <input {...getInputProps()} />
        <div className='upload-content'>
          <div className='upload-icon'>📷</div>
          {isDragActive ? (
            <p>Drop the photos here to preview...</p>
          ) : (
            <>
              <p>Drag & drop photos here, or click to select</p>
              <p className='upload-hint'>
                Preview thumbnails before processing • Supports: JPG, PNG, WebP,
                HEIC • Max: 10MB per image • Up to 50 photos
              </p>
            </>
          )}
        </div>
      </div>

      {/* Thumbnails Preview */}
      {showThumbnails && uploadedFiles.length > 0 && (
        <div className='photo-thumbnails-section'>
          <div className='thumbnails-header'>
            <h4>Photo Preview ({uploadedFiles.length}/50)</h4>
            <div className='thumbnails-actions'>
              <button onClick={clearAll} className='clear-all-btn'>
                Clear All
              </button>
              <button
                onClick={handleStartProcessing}
                disabled={isProcessing || uploadedFiles.length === 0}
                className='start-processing-btn'
              >
                {isProcessing
                  ? 'Processing...'
                  : `Start Processing ${uploadedFiles.length} Photos`}
              </button>
            </div>
          </div>

          <div className='thumbnails-grid'>
            {uploadedFiles.map(fileInfo => (
              <div key={fileInfo.id} className='thumbnail-item'>
                <div className='thumbnail-preview'>
                  <img src={fileInfo.preview} alt={fileInfo.file.name} />
                  <button
                    onClick={() => removeFile(fileInfo.id)}
                    className='remove-thumbnail-btn'
                  >
                    ×
                  </button>
                </div>
                <div className='thumbnail-info'>
                  <p className='thumbnail-name'>{fileInfo.file.name}</p>
                  <p className='thumbnail-size'>
                    {(fileInfo.file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default PhotoUpload;
