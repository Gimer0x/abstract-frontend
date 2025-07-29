import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';

const SubscriptionContext = createContext();

export const useSubscription = () => {
  const context = useContext(SubscriptionContext);
  if (!context) {
    throw new Error('useSubscription must be used within a SubscriptionProvider');
  }
  return context;
};

export const SubscriptionProvider = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [subscription, setSubscription] = useState(null);
  const [usage, setUsage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch subscription data
  const fetchSubscriptionData = useCallback(async () => {
    if (!isAuthenticated || !user) {
      setSubscription(null);
      setUsage(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001';
      const token = localStorage.getItem('token');
      
      if (!token) {
        setError('No authentication token found');
        return;
      }

      const response = await fetch(`${API_BASE_URL}/billing/subscription`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setSubscription(data.subscription);
        setUsage(data.usage);
      } else if (response.status === 401) {
        // Token is invalid, clear subscription data
        setSubscription(null);
        setUsage(null);
        setError('Authentication required');
      } else {
        const errorText = await response.text();
        console.error('Failed to fetch subscription data:', response.status, errorText);
        setError('Failed to load subscription data');
      }
    } catch (err) {
      console.error('Error fetching subscription data:', err);
      setError('Error loading subscription data');
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, user]);

  // Create checkout session
  const createCheckoutSession = async (priceId) => {
    try {
      const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001';
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('Authentication required');
      }

      const response = await fetch(`${API_BASE_URL}/billing/create-checkout-session`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ priceId })
      });

      if (response.ok) {
        const { url } = await response.json();
        window.location.href = url; // Redirect to Stripe Checkout
      } else if (response.status === 401) {
        throw new Error('Authentication required');
      } else {
        throw new Error('Failed to create checkout session');
      }
    } catch (err) {
      console.error('Error creating checkout session:', err);
      throw err;
    }
  };

  // Cancel subscription
  const cancelSubscription = async () => {
    try {
      const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001';
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('Authentication required');
      }

      const response = await fetch(`${API_BASE_URL}/billing/cancel-subscription`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        await fetchSubscriptionData(); // Refresh data
        return true;
      } else if (response.status === 401) {
        throw new Error('Authentication required');
      } else {
        throw new Error('Failed to cancel subscription');
      }
    } catch (err) {
      console.error('Error canceling subscription:', err);
      throw err;
    }
  };

  // Reactivate subscription
  const reactivateSubscription = async () => {
    try {
      const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001';
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('Authentication required');
      }

      const response = await fetch(`${API_BASE_URL}/billing/reactivate-subscription`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        await fetchSubscriptionData(); // Refresh data
        return true;
      } else if (response.status === 401) {
        throw new Error('Authentication required');
      } else {
        throw new Error('Failed to reactivate subscription');
      }
    } catch (err) {
      console.error('Error reactivating subscription:', err);
      throw err;
    }
  };

  // Check if user can access a feature
  const canAccessFeature = (feature) => {
    if (!subscription) return false;

    const plan = subscription.plan;
    
    switch (feature) {
      case 'long_summary':
        return plan === 'premium' || plan === 'pro';
      case 'document_history':
        return plan === 'premium' || plan === 'pro';
      case 'no_watermark':
        return plan === 'premium' || plan === 'pro';
      case 'advanced_analytics':
        return plan === 'pro';
      case 'white_label':
        return plan === 'pro';
      default:
        return false;
    }
  };

  // Check if user can upload more documents
  const canUploadMore = () => {
    if (!subscription || !usage) {
      return false;
    }
    
    const plan = subscription.plan;
    const currentDocuments = usage.documentsThisMonth || usage.documentCount || 0;
    const currentPages = usage.pagesThisMonth || usage.pageCount || 0;
    const limits = usage.limits || { documents: 5, pages: 100 };
    
    // Check both document and page limits
    if (plan === 'pro') {
      return true; // Unlimited
    }
    
    const documentLimit = limits.documents === Infinity ? Infinity : limits.documents;
    const pageLimit = limits.pages === Infinity ? Infinity : limits.pages;
    
    return currentDocuments < documentLimit && currentPages < pageLimit;
  };

  // Get remaining documents for current month
  const getRemainingDocuments = () => {
    if (!subscription || !usage) return 0;
    
    const plan = subscription.plan;
    const currentDocuments = usage.documentsThisMonth || usage.documentCount || 0;
    const limits = usage.limits || { documents: 5, pages: 100 };
    
    if (plan === 'pro') {
      return 'Unlimited';
    }
    
    const documentLimit = limits.documents === Infinity ? Infinity : limits.documents;
    return Math.max(0, documentLimit - currentDocuments);
  };

  // Get remaining pages for current month
  const getRemainingPages = () => {
    if (!subscription || !usage) return 0;
    
    const plan = subscription.plan;
    const currentPages = usage.pagesThisMonth || usage.pageCount || 0;
    const limits = usage.limits || { documents: 5, pages: 100 };
    
    if (plan === 'pro') {
      return 'Unlimited';
    }
    
    const pageLimit = limits.pages === Infinity ? Infinity : limits.pages;
    return Math.max(0, pageLimit - currentPages);
  };

  // Refresh subscription data
  const refreshData = () => {
    fetchSubscriptionData();
  };

  // Effect to fetch subscription data when user changes
  useEffect(() => {
    fetchSubscriptionData();
  }, [fetchSubscriptionData]);

  const value = {
    subscription,
    usage,
    loading,
    error,
    createCheckoutSession,
    cancelSubscription,
    reactivateSubscription,
    canAccessFeature,
    canUploadMore,
    getRemainingDocuments,
    getRemainingPages,
    refreshData
  };

  return (
    <SubscriptionContext.Provider value={value}>
      {children}
    </SubscriptionContext.Provider>
  );
}; 