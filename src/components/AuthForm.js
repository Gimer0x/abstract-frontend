import { useState } from 'react';
import axios from 'axios';
import './AuthForm.css';
import ForgotPassword from './ForgotPassword';

const AuthForm = ({ onLogin, onClose }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5001';
  console.log('API URL being used:', apiUrl);

  const handleInputChange = e => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError(''); // Clear error when user starts typing
  };

  const handleGoogleLogin = () => {
    const googleAuthUrl = `${apiUrl}/auth/google`;
    console.log('Redirecting to Google OAuth:', googleAuthUrl);
    window.location.href = googleAuthUrl;
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (!isLogin && formData.password !== formData.confirmPassword) {
        setError('Passwords do not match');
        setLoading(false);
        return;
      }

      const endpoint = isLogin ? '/auth/login' : '/auth/register';
      const payload = isLogin
        ? { email: formData.email, password: formData.password }
        : {
          name: formData.name,
          email: formData.email,
          password: formData.password,
        };

      const response = await axios.post(`${apiUrl}${endpoint}`, payload);

      // Call the onLogin callback with the token
      onLogin(response.data.token);
    } catch (error) {
      setError(
        error.response?.data?.error || 'An error occurred. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setFormData({ name: '', email: '', password: '', confirmPassword: '' });
    setError('');
  };

  const handleForgotPassword = () => {
    setShowForgotPassword(true);
  };

  const handleBackToLogin = () => {
    setShowForgotPassword(false);
  };

  if (showForgotPassword) {
    return (
      <ForgotPassword onClose={onClose} onBackToLogin={handleBackToLogin} />
    );
  }

  return (
    <div className='auth-overlay'>
      <div className='auth-modal'>
        <button className='auth-close-btn' onClick={onClose}>
          ×
        </button>

        <div className='auth-header'>
          <h2>{isLogin ? 'Sign In' : 'Create Account'}</h2>
          <p>
            {isLogin
              ? 'Welcome back! Sign in to your account'
              : 'Join us to start summarizing documents'}
          </p>
        </div>

        {error && <div className='auth-error'>{error}</div>}

        <form onSubmit={handleSubmit} className='auth-form'>
          {!isLogin && (
            <div className='form-group'>
              <label htmlFor='name'>Full Name</label>
              <input
                type='text'
                id='name'
                name='name'
                value={formData.name}
                onChange={handleInputChange}
                required={!isLogin}
                placeholder='Enter your full name'
              />
            </div>
          )}

          <div className='form-group'>
            <label htmlFor='email'>Email</label>
            <input
              type='email'
              id='email'
              name='email'
              value={formData.email}
              onChange={handleInputChange}
              required
              placeholder='Enter your email'
            />
          </div>

          <div className='form-group'>
            <label htmlFor='password'>Password</label>
            <input
              type='password'
              id='password'
              name='password'
              value={formData.password}
              onChange={handleInputChange}
              required
              placeholder='Enter your password'
              minLength={6}
            />
            {isLogin && (
              <button
                type='button'
                className='forgot-password-link'
                onClick={handleForgotPassword}
              >
                Forgot your password?
              </button>
            )}
          </div>

          {!isLogin && (
            <div className='form-group'>
              <label htmlFor='confirmPassword'>Confirm Password</label>
              <input
                type='password'
                id='confirmPassword'
                name='confirmPassword'
                value={formData.confirmPassword}
                onChange={handleInputChange}
                required={!isLogin}
                placeholder='Confirm your password'
                minLength={6}
              />
            </div>
          )}

          <button type='submit' className='auth-submit-btn' disabled={loading}>
            {loading ? 'Processing...' : isLogin ? 'Sign In' : 'Create Account'}
          </button>
        </form>

        <div className='auth-divider'>
          <span>or</span>
        </div>

        <button
          className='google-auth-btn'
          onClick={handleGoogleLogin}
          type='button'
        >
          <img
            src='https://developers.google.com/identity/images/g-logo.png'
            alt='Google'
            className='google-icon'
          />
          Continue with Google
        </button>

        <div className='auth-footer'>
          <p>
            {isLogin ? "Don't have an account? " : 'Already have an account? '}
            <button
              type='button'
              className='auth-toggle-btn'
              onClick={toggleMode}
            >
              {isLogin ? 'Sign up' : 'Sign in'}
            </button>
          </p>
        </div>

        <div className='guest-option'>
          <p>Or continue as a guest (limited to short summaries only)</p>
          <button type='button' className='guest-btn' onClick={onClose}>
            Continue as Guest
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuthForm;
