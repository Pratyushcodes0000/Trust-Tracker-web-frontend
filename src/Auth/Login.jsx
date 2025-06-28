import React from 'react';
import './Login.css';
import { GoogleLogin, GoogleOAuthProvider } from '@react-oauth/google';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID; // From .env
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL; // From .env

const Login = () => {
  const handleSuccess = async (credentialResponse) => {
    console.log('Google credential:', credentialResponse.credential);
    const token = credentialResponse.credential;
    
    try {
      // Store token in localStorage
      localStorage.setItem('google_token', token);
      
      // Send token to backend for verification and user creation
      const response = await fetch(`${API_BASE_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken: token }),
      });

      const data = await response.json();
      
      if (response.ok && data.success) {
        console.log('Login success:', data);
        // Store user info if needed
        localStorage.setItem('user_info', JSON.stringify(data.user));
        // Redirect to dashboard
        window.location.href = '/';
      } else {
        console.error('Login failed:', data.message);
        localStorage.removeItem('google_token');
        alert('Login failed: ' + (data.message || 'Unknown error'));
      }
    } catch (err) {
      console.error('Login error:', err.message);
      localStorage.removeItem('google_token');
      alert('Login error: ' + err.message);
    }
  };

  const handleError = () => {
    alert('Google Sign In was unsuccessful. Please try again.');
  };

  const handleLogout = () => {
    localStorage.removeItem('google_token');
    localStorage.removeItem('user_info');
    window.location.href = '/login';
  };

  const isLoggedIn = !!localStorage.getItem('google_token');

  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <div className="login-container">
        <div className="login-card">
          <h2 className="login-title">Sign in to Your Account</h2>
          {isLoggedIn ? (
            <button className="google-btn" onClick={handleLogout}>
              Log Out
            </button>
          ) : (
            <GoogleLogin
              onSuccess={handleSuccess}
              onError={handleError}
              width="260"
              shape="pill"
              text="signin_with"
              theme="outline"
              size="large"
            />
          )}
        </div>
      </div>
    </GoogleOAuthProvider>
  );
};

export default Login;
