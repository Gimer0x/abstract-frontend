import React from 'react';
import './SummarySizeSelector.css';

const SummarySizeSelector = ({ selectedSize, onSizeChange, isProcessing }) => {
  const sizeOptions = [
    {
      value: 'short',
      label: 'Short',
      description: '1 paragraph summary',
      icon: '📝',
      color: '#28a745'
    },
    {
      value: 'medium',
      label: 'Medium',
      description: '3 paragraphs with detailed coverage',
      icon: '📄',
      color: '#007bff'
    },
    {
      value: 'long',
      label: 'Large',
      description: '5 paragraphs comprehensive coverage',
      icon: '📚',
      color: '#6f42c1'
    }
  ];

  return (
    <div className="summary-size-selector">
      <div className="selector-header">
        <h3>Summary Size</h3>
        <p>Choose how detailed you want your summary to be</p>
      </div>
      
      <div className="size-options">
        {sizeOptions.map((option) => (
          <button
            key={option.value}
            className={`size-option ${selectedSize === option.value ? 'selected' : ''} ${isProcessing ? 'disabled' : ''}`}
            onClick={() => !isProcessing && onSizeChange(option.value)}
            disabled={isProcessing}
            style={{ '--option-color': option.color }}
          >
            <div className="option-icon">{option.icon}</div>
            <div className="option-content">
              <span className="option-label">{option.label}</span>
              <span className="option-description">{option.description}</span>
            </div>
            {selectedSize === option.value && (
              <div className="selected-indicator">✓</div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
};

export default SummarySizeSelector; 