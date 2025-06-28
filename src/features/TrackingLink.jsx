import React, { useState, useEffect } from 'react';
import './TrackingLink.css';

const TrackingLink = () => {
  const [trackingData, setTrackingData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [trackingId, setTrackingId] = useState('');

  // Get tracking ID from URL parameters or path
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const pathSegments = window.location.pathname.split('/');
    
    // Try to get tracking ID from URL parameters first
    let id = urlParams.get('id') || urlParams.get('tracking');
    
    // If not found in parameters, try to get from path
    if (!id && pathSegments.length > 2) {
      id = pathSegments[2]; // /track/TRACKING_CODE
    }
    
    if (id) {
      setTrackingId(id);
      fetchTrackingData(id);
    } else {
      setError('No tracking ID provided');
      setLoading(false);
    }
  }, []);

  const fetchTrackingData = async (id) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/track/${id}`);
      
      if (!response.ok) {
        throw new Error('Tracking information not found');
      }
      
      const data = await response.json();
      setTrackingData(data);
    } catch (err) {
      console.error('Error fetching tracking data:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const statusColors = {
      'Created': '#3498db',
      'Shipped': '#f39c12',
      'Dispatched': '#9b59b6',
      'In Transit': '#e67e22',
      'Out for Delivery': '#e74c3c',
      'Delivered': '#27ae60',
      'Failed': '#e74c3c',
      'Returned': '#95a5a6',
      'Cancelled': '#7f8c8d'
    };
    return statusColors[status] || '#95a5a6';
  };

  const getStatusIcon = (status) => {
    const statusIcons = {
      'Created': '📦',
      'Shipped': '🚚',
      'Dispatched': '📤',
      'In Transit': '🚛',
      'Out for Delivery': '🛵',
      'Delivered': '✅',
      'Failed': '❌',
      'Returned': '↩️',
      'Cancelled': '🚫'
    };
    return statusIcons[status] || '📋';
  };

  const getProgressPercentage = (status) => {
    const statusProgress = {
      'Created': 10,
      'Shipped': 25,
      'Dispatched': 40,
      'In Transit': 60,
      'Out for Delivery': 80,
      'Delivered': 100,
      'Failed': 0,
      'Returned': 0,
      'Cancelled': 0
    };
    return statusProgress[status] || 0;
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="tracking-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading tracking information...</p>
        </div>
      </div>
    );
  }

  if (error && error === 'No tracking ID provided') {
    return (
      <div className="tracking-container">
        <div className="tracking-form">
          <div className="logo">
            <span className="logo-icon">📦</span>
            <h1>TrustTrack</h1>
          </div>
          <h2>Track Your Package</h2>
          <p>Enter your tracking ID to get real-time updates</p>
          
          <form onSubmit={(e) => {
            e.preventDefault();
            if (trackingId.trim()) {
              fetchTrackingData(trackingId.trim());
            }
          }}>
            <div className="form-group">
              <input
                type="text"
                placeholder="Enter tracking ID (e.g., TRK-ABC123)"
                value={trackingId}
                onChange={(e) => setTrackingId(e.target.value)}
                className="tracking-input"
                required
              />
            </div>
            <button type="submit" className="track-button">
              Track Package
            </button>
          </form>
          
          <div className="tracking-footer">
            <p>Powered by TrustTrack - Reliable Package Tracking</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="tracking-container">
        <div className="error-message">
          <div className="error-icon">❌</div>
          <h2>Tracking Not Found</h2>
          <p>{error}</p>
          <p>Please check your tracking ID and try again.</p>
        </div>
      </div>
    );
  }

  if (!trackingData) {
    return (
      <div className="tracking-container">
        <div className="error-message">
          <div className="error-icon">📋</div>
          <h2>No Tracking Data</h2>
          <p>Unable to load tracking information.</p>
        </div>
      </div>
    );
  }

  const progressPercentage = getProgressPercentage(trackingData.currentStatus);

  return (
    <div className="tracking-container">
      <div className="tracking-header">
        <div className="logo">
          <span className="logo-icon">📦</span>
          <h1>TrustTrack</h1>
        </div>
        <div className="tracking-id">
          <span>Tracking ID: {trackingData.internalTrackingCode}</span>
        </div>
      </div>

      <div className="shipment-info">
        <div className="customer-details">
          <h2>Shipment Details</h2>
          <div className="info-grid">
            <div className="info-item">
              <label>Customer:</label>
              <span>{trackingData.customerName}</span>
            </div>
            <div className="info-item">
              <label>Courier:</label>
              <span>{trackingData.courierName}</span>
            </div>
            <div className="info-item">
              <label>Tracking Number:</label>
              <span>{trackingData.trackingId}</span>
            </div>
            <div className="info-item">
              <label>Order Date:</label>
              <span>{formatDate(trackingData.createdAt)}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="progress-section">
        <div className="current-status">
          <div className="status-icon" style={{ backgroundColor: getStatusColor(trackingData.currentStatus) }}>
            {getStatusIcon(trackingData.currentStatus)}
          </div>
          <div className="status-info">
            <h3>Current Status</h3>
            <p className="status-text">{trackingData.currentStatus}</p>
            {trackingData.deliveryDate && (
              <p className="delivery-date">
                Delivered on {formatDate(trackingData.deliveryDate)}
              </p>
            )}
          </div>
        </div>

        <div className="progress-bar-container">
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ width: `${progressPercentage}%`, backgroundColor: getStatusColor(trackingData.currentStatus) }}
            ></div>
          </div>
          <div className="progress-labels">
            <span className="progress-label">Order Placed</span>
            <span className="progress-label">Shipped</span>
            <span className="progress-label">In Transit</span>
            <span className="progress-label">Out for Delivery</span>
            <span className="progress-label">Delivered</span>
          </div>
        </div>
      </div>

      <div className="tracking-timeline">
        <h3>Tracking History</h3>
        <div className="timeline">
          {trackingData.logs && trackingData.logs.length > 0 ? (
            trackingData.logs.map((log, index) => (
              <div key={index} className="timeline-item">
                <div className="timeline-marker" style={{ backgroundColor: getStatusColor(log.status) }}>
                  {getStatusIcon(log.status)}
                </div>
                <div className="timeline-content">
                  <div className="timeline-status">{log.status}</div>
                  <div className="timeline-time">{formatDate(log.timestamp)}</div>
                  {log.note && <div className="timeline-note">{log.note}</div>}
                  {log.location && log.location.lat && (
                    <div className="timeline-location">
                      📍 {log.location.lat}, {log.location.lng}
                    </div>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="no-logs">
              <p>No tracking updates available yet.</p>
            </div>
          )}
        </div>
      </div>

      <div className="contact-info">
        <h3>Need Help?</h3>
        <p>If you have any questions about your shipment, please contact us:</p>
        <div className="contact-details">
          <div className="contact-item">
            <span className="contact-icon">📧</span>
            <span>support@trusttrack.com</span>
          </div>
          <div className="contact-item">
            <span className="contact-icon">📞</span>
            <span>+91 98765 43210</span>
          </div>
        </div>
      </div>

      <div className="tracking-footer">
        <p>Powered by TrustTrack - Reliable Package Tracking</p>
      </div>
    </div>
  );
};

export default TrackingLink;
