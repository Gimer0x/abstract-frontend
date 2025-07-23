import React from 'react';
import './LoginButton.css';

const LoginButton = ({ onLogin }) => {
  const handleGoogleLogin = () => {
    const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5001';
    window.location.href = `${apiUrl}/auth/google`;
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h2>Welcome to Document Summarizer</h2>
        <p>Sign in to access all features and save your document history</p>
        
        <div className="login-benefits">
          <div className="benefit-item">
            <span className="benefit-icon">📄</span>
            <span>Access to all summary sizes (short, medium, long)</span>
          </div>
          <div className="benefit-item">
            <span className="benefit-icon">💾</span>
            <span>Save and track your document history</span>
          </div>
          <div className="benefit-item">
            <span className="benefit-icon">🔒</span>
            <span>Secure authentication with Google</span>
          </div>
        </div>

        <button 
          className="google-login-btn"
          onClick={handleGoogleLogin}
        >
          <img 
            src="https://developers.google.com/identity/images/g-logo.png" 
            alt="Google" 
            className="google-icon"
          />
          Sign in with Google
        </button>

        <div className="guest-notice">
          <p>Or continue as a guest (limited to short summaries only)</p>
          <button 
            className="guest-btn"
            onClick={onLogin}
          >
            Continue as Guest
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginButton; 