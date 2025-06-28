// Utility functions for authentication
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Check if token is expired (Google ID tokens expire in 1 hour)
export const isTokenExpired = (token) => {
  if (!token) return true;
  
  try {
    // Decode the JWT token to get expiration time
    const payload = JSON.parse(atob(token.split('.')[1]));
    const currentTime = Math.floor(Date.now() / 1000);
    
    // Check if token is expired (with 5 minute buffer)
    return payload.exp < (currentTime + 300);
  } catch (error) {
    console.error('Error parsing token:', error);
    return true;
  }
};

// Validate token with backend
export const validateToken = async (token) => {
  try {
    const response = await fetch(`${API_BASE_URL}/validate-token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });
    
    return response.ok;
  } catch (error) {
    console.error('Token validation error:', error);
    return false;
  }
};

// Get valid token or redirect to login
export const getValidToken = () => {
  const token = localStorage.getItem('google_token');
  
  if (!token || isTokenExpired(token)) {
    // Token is expired or missing, redirect to login
    localStorage.removeItem('google_token');
    localStorage.removeItem('user_info');
    window.location.href = '/login';
    return null;
  }
  
  return token;
};

// Make authenticated API request
export const authenticatedFetch = async (url, options = {}) => {
  const token = getValidToken();
  
  if (!token) {
    throw new Error('No valid token available');
  }
  
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      ...options.headers,
    },
  });
  
  if (response.status === 401) {
    // Token is invalid, redirect to login
    localStorage.removeItem('google_token');
    localStorage.removeItem('user_info');
    window.location.href = '/login';
    throw new Error('Authentication failed');
  }
  
  return response;
}; 