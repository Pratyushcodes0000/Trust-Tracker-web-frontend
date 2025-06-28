import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Header from './components/Header';
import './App.css';
import CreateShipment from './features/CreateShipment';
import Dashboard from './features/Dashboard';
import Login from './Auth/Login';
import TrackingLink from './features/TrackingLink';

function PrivateRoute({ children }) {
  const token = localStorage.getItem('google_token');
  const location = useLocation();
  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  return children;
}

function PublicRoute({ children }) {
  const token = localStorage.getItem('google_token');
  if (token) {
    return <Navigate to="/" replace />;
  }
  return children;
}

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/track" element={<TrackingLink />} />
        <Route path="/track/:trackingCode" element={<TrackingLink />} />
        <Route path="/login" element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        } />
        <Route path="/create-shipment" element={
          <PrivateRoute>
            <Header />
            <CreateShipment />
          </PrivateRoute>
        } />
        <Route path="/" element={
          <PrivateRoute>
            <Header />
            <Dashboard />
          </PrivateRoute>
        } />
        {/* Add more private routes as needed */}
      </Routes>
    </Router>
  );
};

export default App;