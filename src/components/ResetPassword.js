import { useState, useEffect } from 'react';
import axios from 'axios';
import './ResetPassword.css';

const ResetPassword = () => {
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [token, setToken] = useState('');

  const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5001';

  useEffect(() => {
    const checkToken = () => {
      // Try to get token from hash first
      let tokenFromUrl = null;
      if (window.location.hash) {
        const hashParams = new URLSearchParams(
          window.location.hash.substring(1),
        );
        tokenFromUrl = hashParams.get('token');
      }

      // Fallback to query parameters
      if (!tokenFromUrl) {
        const urlParams = new URLSearchParams(window.location.search);
        tokenFromUrl = urlParams.get('token');
      }

      if (!tokenFromUrl) {
        setError('Invalid reset link. Please request a new password reset.');
        return;
      }

      setToken(tokenFromUrl);
      setError(''); // Clear any previous errors
    };

    checkToken();

    // Listen for URL changes
    const handleUrlChange = () => {
      setTimeout(checkToken, 100); // Small delay to ensure URL is updated
    };

    window.addEventListener('popstate', handleUrlChange);
    window.addEventListener('hashchange', handleUrlChange);

    return () => {
      window.removeEventListener('popstate', handleUrlChange);
      window.removeEventListener('hashchange', handleUrlChange);
    };
  }, []);

  const handleInputChange = e => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError(''); // Clear error when user starts typing
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      setLoading(false);
      return;
    }

    try {
      await axios.post(`${apiUrl}/auth/reset-password`, {
        token,
        password: formData.password,
      });

      setSuccess(true);
    } catch (error) {
      setError(
        error.response?.data?.error || 'An error occurred. Please try again.',
      );
    } finally {
      setLoading(false);
    }
  };

  const handleBackToLogin = () => {
    window.location.href = '/';
  };

  if (success) {
    return (
      <div className='reset-password-container'>
        <div className='reset-password-card'>
          <div className='reset-password-header'>
            <h2>Password Reset Successful</h2>
            <p>Your password has been successfully reset.</p>
          </div>

          <div className='reset-password-success'>
            <div className='success-icon'>✓</div>
            <p>You can now sign in with your new password.</p>
          </div>

          <button className='back-to-login-btn' onClick={handleBackToLogin}>
            Back to Sign In
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className='reset-password-container'>
      <div className='reset-password-card'>
        <div className='reset-password-header'>
          <h2>Reset Your Password</h2>
          <p>Enter your new password below.</p>
        </div>

        {error && <div className='reset-password-error'>{error}</div>}

        <form onSubmit={handleSubmit} className='reset-password-form'>
          <div className='form-group'>
            <label htmlFor='password'>New Password</label>
            <input
              type='password'
              id='password'
              name='password'
              value={formData.password}
              onChange={handleInputChange}
              required
              placeholder='Enter your new password'
              minLength={6}
            />
          </div>

          <div className='form-group'>
            <label htmlFor='confirmPassword'>Confirm New Password</label>
            <input
              type='password'
              id='confirmPassword'
              name='confirmPassword'
              value={formData.confirmPassword}
              onChange={handleInputChange}
              required
              placeholder='Confirm your new password'
              minLength={6}
            />
          </div>

          <button
            type='submit'
            className='reset-password-submit-btn'
            disabled={loading || !token}
          >
            {loading ? 'Resetting...' : 'Reset Password'}
          </button>
        </form>

        <div className='reset-password-footer'>
          <button
            type='button'
            className='back-to-login-btn'
            onClick={handleBackToLogin}
          >
            Back to Sign In
          </button>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
