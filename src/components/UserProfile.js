import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSubscription } from '../context/SubscriptionContext';
import './UserProfile.css';

const UserProfile = ({ onNavigateToPricing }) => {
  const { user, logout } = useAuth();
  const { subscription, usage, getRemainingDocuments } = useSubscription();
  const [showDropdown, setShowDropdown] = useState(false);

  const handleLogout = () => {
    logout();
    setShowDropdown(false);
  };

  const toggleDropdown = () => {
    setShowDropdown(!showDropdown);
  };

  if (!user) return null;

  return (
    <div className="user-profile">
      <div className="user-avatar" onClick={toggleDropdown}>
        {user.picture ? (
          <img src={user.picture} alt={user.name} className="avatar-image" />
        ) : (
          <div className="avatar-placeholder">
            {user.name.charAt(0).toUpperCase()}
          </div>
        )}
        <span className="user-name">{user.name}</span>
        <span className="dropdown-arrow">▼</span>
      </div>

      {showDropdown && (
        <div className="user-dropdown">
          <div className="dropdown-header">
            <div className="user-info">
              <div className="user-full-name">{user.name}</div>
              <div className="user-email">{user.email}</div>
            </div>
          </div>
          
          {subscription && (
            <div className="subscription-info">
              <div className="plan-badge">
                {subscription.plan === 'free' && '🆓 Free'}
                {subscription.plan === 'premium' && '💎 Premium'}
                {subscription.plan === 'pro' && '🚀 Pro'}
              </div>
              {usage && (
                <div className="usage-info">
                  <span>Documents: {usage.documentCount}</span>
                  <span>Remaining: {getRemainingDocuments()}</span>
                </div>
              )}
            </div>
          )}
          
          <div className="dropdown-divider"></div>
          <button className="dropdown-item" onClick={() => {
            onNavigateToPricing();
            setShowDropdown(false);
          }}>
            <span className="upgrade-icon">💎</span>
            Manage Subscription
          </button>
          <button className="dropdown-item" onClick={handleLogout}>
            <span className="logout-icon">🚪</span>
            Sign Out
          </button>
        </div>
      )}

      {showDropdown && (
        <div className="dropdown-overlay" onClick={() => setShowDropdown(false)} />
      )}
    </div>
  );
};

export default UserProfile; 