import React, { useState, useEffect } from 'react';
import './DashBoard.css';
import { Bar, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { authenticatedFetch } from '../utils/auth';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const STATUS_OPTIONS = [
  'Dispatched',
  'Out for Delivery',
  'In Transit',
  'Delivered',
  'Cancelled',
];

const Dashboard = () => {
  const [shipments, setShipments] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedShipment, setSelectedShipment] = useState(null);
  const [newStatus, setNewStatus] = useState('');
  const [dashboardData, setDashboardData] = useState({
    totalShipments: 0,
    deliveredShipments: 0,
    inTransitShipments: 0,
    ordersPerWeek: { labels: [], data: [] },
    deliveryPerformance: { labels: [], data: [] },
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const googleToken = localStorage.getItem('google_token');
  
        // ❗ Warn and exit early if token is missing
        if (!googleToken) {
          console.warn('⚠️ No Google token found in localStorage');
          return;
        }
  
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/dashboard`, {
          headers: {
            'Authorization': `Bearer ${googleToken}`,
            'Content-Type': 'application/json',
          },
        });
  
        if (!response.ok) {
          const errorBody = await response.json().catch(() => ({}));
          console.error('❌ Dashboard fetch failed:', errorBody);
          throw new Error('Failed to fetch dashboard data');
        }
  
        const data = await response.json();
  
        setDashboardData({
          totalShipments: data.totalShipments || 0,
          deliveredShipments: data.deliveredShipments || 0,
          inTransitShipments: data.inTransitShipments || 0,
          ordersPerWeek: {
            labels: (data.ordersPerWeek || []).map(item => item.week),
            data: (data.ordersPerWeek || []).map(item => item.count),
          },
          deliveryPerformance: {
            labels: (data.deliveryPerformance || []).map(item => item.week),
            data: (data.deliveryPerformance || []).map(item => item.avgDeliveryDays),
          },
        });
  
      } catch (error) {
        console.error('🚨 Error fetching dashboard data:', error.message);
      }
    };
  
    fetchDashboardData();
  }, []);
  

  useEffect(() => {
    const fetchShipments = async () => {
      try {
        const response = await authenticatedFetch(`${import.meta.env.VITE_API_BASE_URL}/api/getShipments`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch shipments');
        }
        const data = await response.json();
        setShipments(data.shipments || []);
      } catch (error) {
        console.error('Error fetching shipments:', error);
        if (error.message === 'Authentication failed') {
          // User will be redirected to login automatically
          return;
        }
      }
    };
    fetchShipments();
  }, []);

  const openModal = (shipment) => {
    setSelectedShipment(shipment);
    setNewStatus(shipment.currentStatus);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelectedShipment(null);
    setNewStatus('');
  };

  const handleStatusChange = (e) => {
    setNewStatus(e.target.value);
  };

  const handleSaveStatus = async () => {
    try {
      const id = selectedShipment._id;
      const response = await authenticatedFetch(`${import.meta.env.VITE_API_BASE_URL}/api/shipments/${id}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status: newStatus }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update shipment status');
      }
      
      setShipments(shipments.map(s =>
        s._id === selectedShipment._id ? { ...s, currentStatus: newStatus } : s
      ));
      closeModal();
    } catch (error) {
      console.error('Error updating shipment status:', error);
      if (error.message === 'Authentication failed') {
        // User will be redirected to login automatically
        return;
      }
      alert('Error updating shipment status: ' + error.message);
    }
  };

  // Helper to get status class
  const getStatusClass = (status) => {
    switch (status) {
      case 'Dispatched':
        return 'dispatched';
      case 'Out for Delivery':
        return 'outfordelivery';
      case 'In Transit':
        return 'in-transit';
      case 'Delivered':
        return 'delivered';
      case 'Cancelled':
        return 'cancelled';
      default:
        return '';
    }
  };

  return (
    <div className="dashboard-container">
      <h2 className="dashboard-title">Dashboard</h2>
      <div className="dashboard-top">
        <div className="dashboard-cards">
          <div className="dashboard-card total-card">
            <div className="card-label">Total Shipments</div>
            <div className="card-value">{dashboardData.totalShipments}</div>
          </div>
          <div className="dashboard-card delivered-card">
            <div className="card-label">Delivered Shipments</div>
            <div className="card-value">{dashboardData.deliveredShipments}</div>
          </div>
          <div className="dashboard-card intransit-card">
            <div className="card-label">In Transit Shipments</div>
            <div className="card-value">{dashboardData.inTransitShipments}</div>
          </div>
        </div>
        <div className="dashboard-charts">
          <div className="chart-card">
            <div className="chart-title">Orders per Week</div>
            <div style={{height:180}}>
              <Bar
                data={{
                  labels: dashboardData.ordersPerWeek.labels,
                  datasets: [
                    {
                      label: 'Orders',
                      data: dashboardData.ordersPerWeek.data,
                      backgroundColor: '#0A84FF',
                      borderRadius: 6,
                    },
                  ],
                }}
                options={{
                  plugins: {
                    legend: { display: false },
                    title: { display: false },
                  },
                  scales: {
                    x: {
                      ticks: { color: '#b3b3b3' },
                      grid: { color: 'rgba(255,255,255,0.04)' },
                    },
                    y: {
                      beginAtZero: true,
                      ticks: { color: '#b3b3b3' },
                      grid: { color: 'rgba(255,255,255,0.04)' },
                    },
                  },
                  responsive: true,
                  maintainAspectRatio: false,
                }}
              />
            </div>
          </div>
          <div className="chart-card">
            <div className="chart-title">Delivery Performance (days)</div>
            <div style={{height:180}}>
              <Line
                data={{
                  labels: dashboardData.deliveryPerformance.labels,
                  datasets: [
                    {
                      label: 'Avg Delivery Time',
                      data: dashboardData.deliveryPerformance.data,
                      borderColor: '#4ade80',
                      backgroundColor: 'rgba(74,222,128,0.15)',
                      tension: 0.4,
                      pointRadius: 4,
                      pointBackgroundColor: '#4ade80',
                    },
                  ],
                }}
                options={{
                  plugins: {
                    legend: { display: false },
                    title: { display: false },
                  },
                  scales: {
                    x: {
                      ticks: { color: '#b3b3b3' },
                      grid: { color: 'rgba(255,255,255,0.04)' },
                    },
                    y: {
                      beginAtZero: true,
                      ticks: { color: '#b3b3b3' },
                      grid: { color: 'rgba(255,255,255,0.04)' },
                    },
                  },
                  responsive: true,
                  maintainAspectRatio: false,
                }}
              />
            </div>
          </div>
        </div>
      </div>
      <div className="shipments-section">
        <h3 className="section-title">Shipments In Progress</h3>
        <div className="shipments-list">
          {shipments.filter(s => s.currentStatus !== 'Delivered').length === 0 ? (
            <div className="empty-list">No shipments in progress.</div>
          ) : (
            shipments.filter(s => s.currentStatus !== 'Delivered').map((shipment) => (
              <div className="shipment-card" key={shipment._id} onClick={() => openModal(shipment)}>
                <div className="shipment-id">{shipment._id}</div>
                <div className="shipment-info">
                  <span className="shipment-customer">{shipment.customerName}</span>
                  <span className="shipment-courier">{shipment.courierName}</span>
                </div>
                <div className={`shipment-status ${getStatusClass(shipment.currentStatus)}`}>{shipment.currentStatus}</div>
              </div>
            ))
          )}
        </div>
        <h3 className="section-title" style={{marginTop: '2.5rem'}}>All Shipments</h3>
        <div className="shipments-list">
          {shipments.length === 0 ? (
            <div className="empty-list">No shipments found.</div>
          ) : (
            shipments.map((shipment) => (
              <div className={`shipment-card ${shipment.currentStatus === 'Delivered' ? 'delivered' : ''}`} key={shipment._id} onClick={() => openModal(shipment)}>
                <div className="shipment-id">{shipment._id}</div>
                <div className="shipment-info">
                  <span className="shipment-customer" key={shipment.customerName}>{shipment.customerName}</span>
                  <span className="shipment-courier" key={shipment.courierName}>{shipment.courierName}</span>
                </div>
                <div className={`shipment-status ${getStatusClass(shipment.currentStatus)}`}>{shipment.currentStatus}</div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Modal for changing status */}
      {modalOpen && selectedShipment && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h3 className="modal-title">Update Shipment Status</h3>
            <div className="modal-details">
              <div><strong>ID:</strong> {selectedShipment._id}</div>
              <div><strong>Customer:</strong> {selectedShipment.customerName}</div>
              <div><strong>Courier:</strong> {selectedShipment.courierName}</div>
              <div><strong>Status:</strong> <span className={`shipment-status ${getStatusClass(selectedShipment.currentStatus)}`}>{selectedShipment.currentStatus}</span></div>
            </div>
            <div className="modal-form-group">
              <label htmlFor="status-select">Status</label>
              <select
                id="status-select"
                value={newStatus}
                onChange={handleStatusChange}
                className="modal-select"
              >
                {STATUS_OPTIONS.map(option => (
                  <option value={option} key={option}>{option}</option>
                ))}
              </select>
            </div>
            <div className="modal-actions">
              <button className="modal-btn save" onClick={handleSaveStatus}>Save</button>
              <button className="modal-btn cancel" onClick={closeModal}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
