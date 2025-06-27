import React from 'react';
import './Login.css';
import { GoogleLogin, GoogleOAuthProvider } from '@react-oauth/google';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID; // From .env
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL; // From .env

const Login = () => {
  const handleSuccess = (credentialResponse) => {
    console.log('Google credential:', credentialResponse.credential);
    const token = credentialResponse.credential;
    localStorage.setItem('google_token',token);
    // Store token in localStorage
    fetch(`${API_BASE_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ idToken: token }),
    })
      .then(data => {
        console.log('Login success:', data);
        if (data.token) {
          // handle token if needed
        }
      })
      .catch(err => {
        console.error('Login error:', err.message);
      });
  };

  const handleError = () => {
    alert('Google Sign In was unsuccessful. Please try again.');
  };

  const handleLogout = () => {
    localStorage.removeItem('google_token');
    localStorage.removeItem('jwt_token'); // ✅ clear backend token too
    localStorage.removeItem('user_id');
    localStorage.removeItem('user_name');
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
