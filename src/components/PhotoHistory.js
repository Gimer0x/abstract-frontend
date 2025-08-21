import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import axios from 'axios';
import './PhotoHistory.css';

const PhotoHistory = () => {
  const { user } = useAuth();
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [downloading, setDownloading] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const photosPerPage = 4;

  const fetchPhotoHistory = useCallback(async () => {
    try {
      console.log('Fetching photos for user:', user?.email);
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL || 'http://localhost:5001'}/api/photos/history`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      // Filter out failed attempts, only show completed photos with batchId
      const completedPhotos = (response.data.photos || []).filter(
        photo => photo.processingStatus === 'completed' && photo.batchId,
      );

      // Group photos by batchId to create batch entries
      const batchMap = new Map();
      completedPhotos.forEach(photo => {
        if (!batchMap.has(photo.batchId)) {
          batchMap.set(photo.batchId, {
            _id: photo.batchId,
            batchId: photo.batchId,
            createdAt: photo.createdAt,
            photos: [],
          });
        }
        batchMap.get(photo.batchId).photos.push(photo);
      });

      const batchEntries = Array.from(batchMap.values())
        .map(batch => ({
          ...batch,
          title: generatePhotoTitle(batch),
        }))
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

      setPhotos(batchEntries);
    } catch (error) {
      console.error('Error fetching photo history:', error);
      setError('Failed to load photo history');
    } finally {
      setLoading(false);
    }
  }, [user?.email]);

  // Fetch photo history on component mount and when user changes
  useEffect(() => {
    if (user) {
      fetchPhotoHistory();
    }
  }, [user, fetchPhotoHistory]);

  // Listen for reload event from start over button
  useEffect(() => {
    const handleReload = () => {
      if (user) {
        setRefreshing(true);
        setCurrentPage(1); // Reset to first page when reloading
        fetchPhotoHistory().finally(() => {
          setRefreshing(false);
        });
      }
    };

    window.addEventListener('reloadPhotoHistory', handleReload);
    return () => {
      window.removeEventListener('reloadPhotoHistory', handleReload);
    };
  }, [user, fetchPhotoHistory]);

  // Helper functions
  const generatePhotoTitle = batch => {
    const photoCount = batch.photos ? batch.photos.length : 1;
    return `Photo Text Extraction (${photoCount} photos)`;
  };

  const formatDate = dateString => {
    const date = new Date(dateString);
    return (
      date.toLocaleDateString() +
      ' ' +
      date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    );
  };

  // Pagination calculations
  const totalPages = Math.ceil(photos.length / photosPerPage);
  const startIndex = (currentPage - 1) * photosPerPage;
  const endIndex = startIndex + photosPerPage;
  const currentPhotos = photos.slice(startIndex, endIndex);

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

  // Download functions
  const handleDownload = async (batch, format) => {
    const batchId = batch.batchId;

    if (downloading[batchId]) return;

    setDownloading(prev => ({ ...prev, [batchId]: true }));

    try {
      const token = localStorage.getItem('token');
      let url, filename;

      switch (format) {
        case 'pdf':
          url = `${process.env.REACT_APP_API_URL || 'http://localhost:5001'}/api/photos/export/pdf`;
          filename = `photo-ocr-${batchId}.pdf`;
          break;
        case 'docx':
          url = `${process.env.REACT_APP_API_URL || 'http://localhost:5001'}/api/photos/export/docx`;
          filename = `photo-ocr-${batchId}.docx`;
          break;
        case 'txt':
          url = `${process.env.REACT_APP_API_URL || 'http://localhost:5001'}/api/photos/export/txt`;
          filename = `photo-ocr-${batchId}.txt`;
          break;
        default:
          throw new Error('Unsupported format');
      }

      const response = await axios.post(
        url,
        { batchId },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          responseType: 'blob',
        }
      );

      // Create download link
      const blob = new Blob([response.data]);
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);

      toast.success(`${format.toUpperCase()} download started`);
    } catch (error) {
      console.error('Download error:', error);
      let errorMessage = 'Download failed';

      if (error.response) {
        if (error.response.data instanceof Blob) {
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
        toast.error('Network error. Please check your connection.');
      } else {
        toast.error(error.message || errorMessage);
      }
    } finally {
      setDownloading(prev => ({ ...prev, [batchId]: false }));
    }
  };

  if (!user) return null;

  if (loading) {
    return (
      <div className='photo-history'>
        <h3>Photo History</h3>
        <div className='loading'>Loading your photos...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className='photo-history'>
        <h3>Photo History</h3>
        <div className='error'>{error}</div>
      </div>
    );
  }

  return (
    <div className='photo-history'>
      <div className='history-header'>
        <h3>Photo History</h3>
        {refreshing && (
          <span className='refreshing-indicator'>🔄 Updating...</span>
        )}
        <div className='photo-stats'>
          <span>Batches: {photos.length}</span>
          {photos.length > photosPerPage && (
            <span>
              Showing: {startIndex + 1}-{Math.min(endIndex, photos.length)}
            </span>
          )}
        </div>
        {photos.length > photosPerPage && (
          <div className='pagination-controls'>
            <button
              className='pagination-btn'
              onClick={goToPreviousPage}
              disabled={currentPage === 1}
              title='Previous page'
            >
              ←
            </button>
            <span className='page-info'>
              Page {currentPage} of {totalPages}
            </span>
            <button
              className='pagination-btn'
              onClick={goToNextPage}
              disabled={currentPage === totalPages}
              title='Next page'
            >
              →
            </button>
          </div>
        )}
      </div>
      {photos.length === 0 ? (
        <div className='empty-state'>
          <div className='empty-icon'>📷</div>
          <p>No photos processed yet</p>
          <span>Your processed photos will appear here</span>
        </div>
      ) : (
        <div className='photos-list'>
          {currentPhotos.length === 0 ? (
            <div className='empty-state'>
              <div className='empty-icon'>📷</div>
              <p>No photos on this page</p>
              <span>Try navigating to another page</span>
            </div>
          ) : (
            currentPhotos.map(batch => (
              <div key={batch._id} className='photo-item'>
                <div className='photo-header'>
                  <div className='photo-name'>{batch.title}</div>
                </div>
                <div className='photo-meta'>
                  <span className='photo-count'>
                    {batch.photos.length} photos
                  </span>
                  <span className='photo-date'>
                    {formatDate(batch.createdAt)}
                  </span>
                </div>
                <div className='photo-actions'>
                  <div className='download-options'>
                    <button
                      className={`download-btn ${downloading[batch.batchId] ? 'downloading' : ''}`}
                      onClick={() => handleDownload(batch, 'pdf')}
                      disabled={downloading[batch.batchId]}
                      title='Download as PDF'
                    >
                      {downloading[batch.batchId] ? '⏳' : '📄'} PDF
                    </button>
                    <button
                      className={`download-btn ${downloading[batch.batchId] ? 'downloading' : ''}`}
                      onClick={() => handleDownload(batch, 'docx')}
                      disabled={downloading[batch.batchId]}
                      title='Download as Word'
                    >
                      {downloading[batch.batchId] ? '⏳' : '📘'} Word
                    </button>
                    <button
                      className={`download-btn ${downloading[batch.batchId] ? 'downloading' : ''}`}
                      onClick={() => handleDownload(batch, 'txt')}
                      disabled={downloading[batch.batchId]}
                      title='Download as Text'
                    >
                      {downloading[batch.batchId] ? '⏳' : '📝'} TXT
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

export default PhotoHistory;
