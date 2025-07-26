import React, { useState } from 'react';
import { useSubscription } from '../context/SubscriptionContext';
import UpgradePrompt from './UpgradePrompt';
import './SummarySizeSelector.css';

const SummarySizeSelector = ({ selectedSize, onSizeChange, isProcessing, isAuthenticated, onNavigateToPricing }) => {

  const { canAccessFeature } = useSubscription();
  const [showUpgradePrompt, setShowUpgradePrompt] = useState(false);
  
  const sizeOptions = [
    {
      value: 'short',
      label: 'Short',
      description: '1 paragraph summary',
      color: '#28a745',
      requiresAuth: false,
      requiresPremium: false
    },
    {
      value: 'medium',
      label: 'Medium',
      description: '3 paragraphs with detailed coverage',
      color: '#007bff',
      requiresAuth: true,
      requiresPremium: false
    },
    {
      value: 'long',
      label: 'Large',
      description: '5 paragraphs comprehensive coverage',
      color: '#6f42c1',
      requiresAuth: true,
      requiresPremium: true
    }
  ];

  const handleSizeChange = (size) => {
    if (isProcessing) return;
    
    const option = sizeOptions.find(opt => opt.value === size);
    
    // Check authentication requirement
    if (option.requiresAuth && !isAuthenticated) {
      return;
    }
    
    // Check premium requirement (only for authenticated users)
    if (isAuthenticated && option.requiresPremium && !canAccessFeature('long_summary')) {
      setShowUpgradePrompt(true);
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
        {isAuthenticated && !canAccessFeature('long_summary') && (
          <div className="premium-notice">
            <span className="premium-icon">💎</span>
            <span>Upgrade to Premium for long summaries</span>
          </div>
        )}
      </div>
      
      <div className="size-options">
        {sizeOptions.map((option) => {
          const isDisabled = isProcessing || (option.requiresAuth && !isAuthenticated);
          
          return (
            <div
              key={option.value}
              className={`text-option ${selectedSize === option.value ? 'selected' : ''} ${isDisabled ? 'disabled' : ''}`}
              onClick={() => !isDisabled && handleSizeChange(option.value)}
              style={{ '--option-color': option.color }}
            >
              <div className="option-content">
                <span className="option-label">{option.label}</span>
              </div>

            </div>
          );
        })}
      </div>
      
      <UpgradePrompt
        type="feature"
        feature="long summaries"
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

export default SummarySizeSelector; 