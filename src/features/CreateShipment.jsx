import React, { useState } from 'react';
import './createShipment.css';
import { authenticatedFetch } from '../utils/auth';

const couriers = [
   {name:'Manual', code:'manual'},
  { name: 'Delhivery', code: 'delhivery' },
  { name: 'Ekart (Flipkart)', code: 'ekart' },
  { name: 'Blue Dart', code: 'bluedart' },
  { name: 'DTDC', code: 'dtdc' },
  { name: 'Ecom Express', code: 'ecom-express' },
  { name: 'India Post', code: 'india-post' },
  { name: 'XpressBees', code: 'xpressbees' },
  { name: 'Shadowfax', code: 'shadowfax' },
  { name: 'FedEx India', code: 'fedex' },
  { name: 'DHL Express', code: 'dhl' },
  { name: 'Amazon Transportation', code: 'amazon-transportation-services' },
  { name: 'Wow Express', code: 'wowexpress' },
  { name: 'Gati', code: 'gati-kwe' },
  { name: 'Trackon Couriers', code: 'trackon' },
  { name: 'Aramex', code: 'aramex' },
];

const CreateShipment = () => {
  const [form, setForm] = useState({
    customerName: '',
    customerPhone: '',
    customerAddress: '',
    courierSlug: '',
    courierName: '',
    trackingId: '',
  });
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleCourierChange = (e) => {
    const { value } = e.target;
    const selectedCourier = couriers.find((c) => c.code === value);
    setForm({
      ...form,
      courierSlug: value,
      courierName: selectedCourier ? selectedCourier.name : 'Manual',
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccess(false);
    
    console.log('📤 Sending shipment data:', form);
    
    try {
      const response = await authenticatedFetch(`${import.meta.env.VITE_API_BASE_URL}/api/createShipments`, {
        method: 'POST',
        body: JSON.stringify(form),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to create shipment');
      }
      
      const result = await response.json();
      console.log('✅ Shipment created successfully:', result);
      
      setSuccess(true);
      setForm({
        customerName: '',
        customerPhone: '',
        customerAddress: '',
        courierSlug: '',
        courierName: '',
        trackingId: '',
      });
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      console.error('Error creating shipment:', error);
      if (error.message === 'Authentication failed') {
        // User will be redirected to login automatically
        return;
      }
      // Show error message to user
      alert('Error creating shipment: ' + error.message);
    }
  };

  const isManualEntry = form.courierSlug === 'manual';

  return (
    <div className="create-shipment-container">
      {success && (
        <div className="success-banner">
          Shipment successfully created
        </div>
      )}
      <form className="shipment-form" onSubmit={handleSubmit} autoComplete="off">
        <h2 className="form-title">Create Shipment</h2>
        <div className="form-group">
          <label htmlFor="customerName">Customer Name</label>
          <input
            type="text"
            id="customerName"
            name="customerName"
            value={form.customerName}
            onChange={handleChange}
            required
            placeholder="Enter customer name"
          />
        </div>
        <div className="form-group">
  <label htmlFor="customerPhone">Customer Phone Number</label>
  <input
    type="tel"
    id="customerPhone"
    name="customerPhone"
    value={form.customerPhone}
    onChange={handleChange}
    required
    placeholder="Enter phone number"
  />
</div>

        <div className="form-group">
          <label htmlFor="customerAddress">Customer Address</label>
          <textarea
            id="customerAddress"
            name="customerAddress"
            value={form.customerAddress}
            onChange={handleChange}
            required
            placeholder="Enter address"
            rows={3}
          />
        </div>
        <div className="form-group">
          <label htmlFor="courierSlug">Courier Name</label>
          <select
            id="courierSlug"
            name="courierSlug"
            value={form.courierSlug}
            onChange={handleCourierChange}
            required
          >
            <option value="" disabled>
              Select a courier
            </option>
            {couriers.map((courier) => (
              <option key={courier.code} value={courier.code}>
                {courier.name}
              </option>
            ))}
          </select>
          {isManualEntry && (
            <input
              style={{ marginTop: '10px' }}
              type="text"
              id="manualCourierName"
              name="courierName"
              value={form.courierName}
              onChange={handleChange}
              required
              placeholder="Enter courier name"
            />
          )}
        </div>
        <div className="form-group">
          <label htmlFor="trackingId">Tracking ID</label>
          <input
            type="text"
            id="trackingId"
            name="trackingId"
            value={form.trackingId}
            onChange={handleChange}
            required
            placeholder="Enter tracking ID"
          />
        </div>
        <button className="create-btn" type="submit">
          Create Shipment
        </button>
      </form>
    </div>
  );
};

export default CreateShipment;