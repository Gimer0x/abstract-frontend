import React from 'react';
import { useSubscription } from '../context/SubscriptionContext';
import './UpgradePrompt.css';

const UpgradePrompt = ({ 
  type = 'limit', 
  feature = null, 
  onClose, 
  onUpgrade,
  onNavigateToPricing,
  show = false 
}) => {
  const { subscription, getRemainingDocuments } = useSubscription();

  if (!show) return null;

  const getTitle = () => {
    switch (type) {
      case 'limit':
        return 'Document Limit Reached';
      case 'feature':
        return 'Premium Feature';
      case 'upgrade':
        return 'Upgrade Your Plan';
      default:
        return 'Upgrade Required';
    }
  };

  const getMessage = () => {
    const plan = subscription?.plan || 'free';
    
    switch (type) {
      case 'limit':
        return `You've reached your ${plan === 'free' ? '5' : '50'} document limit for this month. Upgrade to continue processing documents.`;
      case 'feature':
        return `This feature is only available for Premium and Pro users. Upgrade to unlock ${feature}.`;
      case 'upgrade':
        return 'Upgrade your plan to access more features and higher limits.';
      default:
        return 'This action requires a premium subscription.';
    }
  };

  const getFeatures = () => {
    switch (type) {
      case 'limit':
        return [
          'More documents per month',
          'All summary sizes (Short, Medium, Long)',
          'Full document history',
          'No watermarks on exports'
        ];
      case 'feature':
        return [
          'Unlimited documents',
          'Advanced analytics',
          'White-label exports',
          'Priority support'
        ];
      case 'upgrade':
        return [
          'Higher document limits',
          'Premium features',
          'Better export options',
          'Enhanced support'
        ];
      default:
        return [
          'Premium features',
          'Higher limits',
          'Better experience'
        ];
    }
  };

  const handleUpgrade = () => {
    if (onUpgrade) {
      onUpgrade();
    } else if (onNavigateToPricing) {
      onNavigateToPricing();
    } else {
      // Fallback behavior - redirect to pricing
      window.location.href = '/pricing';
    }
  };

  return (
    <div className="upgrade-prompt-overlay">
      <div className="upgrade-prompt-modal">
        <div className="upgrade-prompt-header">
          <h2>{getTitle()}</h2>
          {onClose && (
            <button className="close-btn" onClick={onClose}>
              ×
            </button>
          )}
        </div>

        <div className="upgrade-prompt-content">
          <div className="upgrade-icon">
            <span>🚀</span>
          </div>
          
          <p className="upgrade-message">{getMessage()}</p>

          {type === 'limit' && (
            <div className="usage-info">
              <p>Current usage: {subscription?.plan === 'free' ? '5/5' : '50/50'} documents</p>
              <p>Remaining: {getRemainingDocuments()} documents</p>
            </div>
          )}

          <div className="upgrade-features">
            <h3>Upgrade to get:</h3>
            <ul>
              {getFeatures().map((feature, index) => (
                <li key={index}>
                  <span className="checkmark">✓</span>
                  {feature}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="upgrade-prompt-actions">
          <button className="upgrade-btn primary" onClick={handleUpgrade}>
            View Plans & Upgrade
          </button>
          {onClose && (
            <button className="upgrade-btn secondary" onClick={onClose}>
              Maybe Later
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default UpgradePrompt; 