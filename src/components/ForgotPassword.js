import React, { useState } from 'react';
import axios from 'axios';
import './ForgotPassword.css';

const ForgotPassword = ({ onClose, onBackToLogin }) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [resetUrl, setResetUrl] = useState('');

  const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5001';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await axios.post(`${apiUrl}/auth/forgot-password`, { email });
      
      setSuccess(true);
      if (response.data.resetUrl) {
        setResetUrl(response.data.resetUrl);
      }
    } catch (error) {
      setError(error.response?.data?.error || 'An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleBackToLogin = () => {
    onBackToLogin();
  };

  if (success) {
    return (
      <div className="forgot-password-overlay">
        <div className="forgot-password-modal">
          <button className="forgot-password-close-btn" onClick={onClose}>
            ×
          </button>
          
          <div className="forgot-password-header">
            <h2>Check Your Email</h2>
            <p>We've sent a password reset link to your email address.</p>
          </div>

          <div className="forgot-password-success">
            <div className="success-icon">✓</div>
            <p>If an account with that email exists, you'll receive a password reset link shortly.</p>
            
            {resetUrl && (
              <div className="reset-link-container">
                <p><strong>Development Mode:</strong> Click the link below to reset your password:</p>
                <a href={resetUrl} className="reset-link" target="_blank" rel="noopener noreferrer">
                  Reset Password
                </a>
              </div>
            )}
          </div>

          <div className="forgot-password-footer">
            <button 
              type="button" 
              className="back-to-login-btn"
              onClick={handleBackToLogin}
            >
              Back to Sign In
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="forgot-password-overlay">
      <div className="forgot-password-modal">
        <button className="forgot-password-close-btn" onClick={onClose}>
          ×
        </button>
        
        <div className="forgot-password-header">
          <h2>Forgot Password</h2>
          <p>Enter your email address and we'll send you a link to reset your password.</p>
        </div>

        {error && (
          <div className="forgot-password-error">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="forgot-password-form">
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="Enter your email address"
            />
          </div>

          <button 
            type="submit" 
            className="forgot-password-submit-btn"
            disabled={loading}
          >
            {loading ? 'Sending...' : 'Send Reset Link'}
          </button>
        </form>

        <div className="forgot-password-footer">
          <button 
            type="button" 
            className="back-to-login-btn"
            onClick={handleBackToLogin}
          >
            Back to Sign In
          </button>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword; 