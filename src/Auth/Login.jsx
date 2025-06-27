import React from 'react';
import './Login.css';
import { GoogleLogin, GoogleOAuthProvider } from '@react-oauth/google';

const GOOGLE_CLIENT_ID = '908385555062-qhajjb6pk2o8jkpc9a8mdumt52rd582b.apps.googleusercontent.com'; // Replace with your client ID

const Login = () => {
  const handleSuccess = (credentialResponse) => {
    console.log('Google credential:', credentialResponse.credential);
    const token = credentialResponse.credential;
    localStorage.setItem('google_token',token);
    // St ore token in localStorage
    fetch('http://localhost:8000/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ idToken: token }),
    })
      
      .then(data => {
        console.log('Login success:', data);
        if (data.token) {
          
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
