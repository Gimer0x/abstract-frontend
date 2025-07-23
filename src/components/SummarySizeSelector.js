import React from 'react';
import './SummarySizeSelector.css';

const SummarySizeSelector = ({ selectedSize, onSizeChange, isProcessing, isAuthenticated }) => {
  const sizeOptions = [
    {
      value: 'short',
      label: 'Short',
      description: '1 paragraph summary',
      icon: '📝',
      color: '#28a745',
      requiresAuth: false
    },
    {
      value: 'medium',
      label: 'Medium',
      description: '3 paragraphs with detailed coverage',
      icon: '📄',
      color: '#007bff',
      requiresAuth: true
    },
    {
      value: 'long',
      label: 'Large',
      description: '5 paragraphs comprehensive coverage',
      icon: '📚',
      color: '#6f42c1',
      requiresAuth: true
    }
  ];

  const handleSizeChange = (size) => {
    if (isProcessing) return;
    
    const option = sizeOptions.find(opt => opt.value === size);
    if (option.requiresAuth && !isAuthenticated) {
      // Don't allow selection, but we could show a toast here
      return;
    }
    
    onSizeChange(size);
  };

  return (
    <div className="summary-size-selector">
      <div className="selector-header">
        <h3>Summary Size</h3>
        <p>Choose how detailed you want your summary to be</p>
        {!isAuthenticated && (
          <div className="auth-notice">
            <span className="auth-icon">🔒</span>
            <span>Sign in to access medium and long summaries</span>
          </div>
        )}
      </div>
      
      <div className="size-options">
        {sizeOptions.map((option) => {
          const isDisabled = isProcessing || (option.requiresAuth && !isAuthenticated);
          const isLocked = option.requiresAuth && !isAuthenticated;
          
          return (
            <button
              key={option.value}
              className={`size-option ${selectedSize === option.value ? 'selected' : ''} ${isDisabled ? 'disabled' : ''} ${isLocked ? 'locked' : ''}`}
              onClick={() => handleSizeChange(option.value)}
              disabled={isDisabled}
              style={{ '--option-color': option.color }}
            >
              <div className="option-icon">
                {option.icon}
                {isLocked && <span className="lock-icon">🔒</span>}
              </div>
              <div className="option-content">
                <span className="option-label">
                  {option.label}
                  {isLocked && <span className="auth-badge">Sign in required</span>}
                </span>
                <span className="option-description">{option.description}</span>
              </div>
              {selectedSize === option.value && !isLocked && (
                <div className="selected-indicator">✓</div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default SummarySizeSelector; 