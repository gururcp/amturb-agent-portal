import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import './AddMerchant.css';
function AddMerchant() {
  const navigate = useNavigate();
  const [services, setServices] = useState([]);
  const [formData, setFormData] = useState({
    businessName: '',
    ownerName: '',
    phone: '',
    address: '',
    city: '',
    nextVisitDate: '',
    interestedServices: [],
    notes: ''
  });
  const [showSoundBoxBanner, setShowSoundBoxBanner] = useState(false);
  const [gpsCoords, setGpsCoords] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  // Silent GPS capture on mount
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setGpsCoords({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude
          });
        },
        () => {
          // Fail silently
        },
        { timeout: 8000, maximumAge: 60000, enableHighAccuracy: true }
      );
    }
  }, []);
  // Fetch services
  useEffect(() => {
    const fetchServices = async () => {
      try {
        const response = await api.get('/services');
        setServices(response.data);
      } catch (error) {
        console.error('Error fetching services:', error);
      }
    };
    fetchServices();
  }, []);
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError('');
  };
  const handleServiceToggle = (serviceId, slug) => {
    const isCurrentlySelected = formData.interestedServices.includes(serviceId);
    if (slug === 'sound_box') {
      if (!isCurrentlySelected) {
        // Sound Box checked - auto-add Current/Savings and UPI/QR
        const currentSavings = services.find(s => s.slug === 'current_savings');
        const upiQr = services.find(s => s.slug === 'upi_qr');
        const newServices = [serviceId];
        if (currentSavings && !formData.interestedServices.includes(currentSavings._id)) {
          newServices.push(currentSavings._id);
        }
        if (upiQr && !formData.interestedServices.includes(upiQr._id)) {
          newServices.push(upiQr._id);
        }
        setFormData(prev => ({
          ...prev,
          interestedServices: [...prev.interestedServices, ...newServices]
        }));
        setShowSoundBoxBanner(true);
      } else {
        // Sound Box unchecked
        setFormData(prev => ({
          ...prev,
          interestedServices: prev.interestedServices.filter(id => id !== serviceId)
        }));
        setShowSoundBoxBanner(false);
      }
    } else {
      // Regular service toggle
      if (isCurrentlySelected) {
        setFormData(prev => ({
          ...prev,
          interestedServices: prev.interestedServices.filter(id => id !== serviceId)
        }));
      } else {
        setFormData(prev => ({
          ...prev,
          interestedServices: [...prev.interestedServices, serviceId]
        }));
      }
    }
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    // Validation
    if (!formData.businessName.trim()) {
      setError('Business name is required');
      return;
    }
    if (!formData.ownerName.trim()) {
      setError('Owner name is required');
      return;
    }
    if (!formData.phone.trim()) {
      setError('Phone number is required');
      return;
    }
    if (formData.phone.length !== 10) {
      setError('Phone number must be 10 digits');
      return;
    }
    try {
      setLoading(true);
      // Attach GPS silently
      const payload = {
        ...formData,
        gps_lat: gpsCoords?.lat || null,
        gps_lng: gpsCoords?.lng || null
      };
      await api.post('/merchants', payload);
      // Success - navigate back
      navigate('/agent/dashboard');
    } catch (error) {
      console.error('Error adding merchant:', error);
      if (error.response?.data?.error?.includes('phone')) {
        setError('This phone number is already registered');
      } else {
        setError(error.response?.data?.error || 'Failed to add merchant');
      }
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="add-merchant-page">
      <div className="page-header">
        <button className="btn-back" onClick={() => navigate(-1)}>
          ← Back
        </button>
        <h1 className="page-title">Add New Merchant</h1>
      </div>
      <form className="merchant-form" onSubmit={handleSubmit}>
        {error && (
          <div className="error-banner">
            {error}
          </div>
        )}
        {/* Business Name */}
        <div className="form-group">
          <label className="form-label">Business Name *</label>
          <input
            type="text"
            name="businessName"
            className="form-input"
            placeholder="e.g., Sharma Electronics"
            value={formData.businessName}
            onChange={handleInputChange}
            required
          />
        </div>
        {/* Owner Name */}
        <div className="form-group">
          <label className="form-label">Owner Name *</label>
          <input
            type="text"
            name="ownerName"
            className="form-input"
            placeholder="e.g., Rajesh Sharma"
            value={formData.ownerName}
            onChange={handleInputChange}
            required
          />
        </div>
        {/* Phone Number */}
        <div className="form-group">
          <label className="form-label">Phone Number *</label>
          <input
            type="tel"
            name="phone"
            className="form-input"
            placeholder="10-digit mobile number"
            value={formData.phone}
            onChange={handleInputChange}
            maxLength="10"
            pattern="[0-9]{10}"
            required
          />
          <div className="form-hint">Used for WhatsApp communication</div>
        </div>
        {/* Next Visit Date */}
        <div className="form-group">
          <label className="form-label">Next Visit Date</label>
          <input
            type="date"
            name="nextVisitDate"
            className="form-input"
            value={formData.nextVisitDate}
            onChange={handleInputChange}
            min={new Date().toISOString().split('T')[0]}
          />
        </div>
        {/* Street Address */}
        <div className="form-group">
          <label className="form-label">Street Address</label>
          <input
            type="text"
            name="address"
            className="form-input"
            placeholder="Shop address"
            value={formData.address}
            onChange={handleInputChange}
          />
        </div>
        {/* City */}
        <div className="form-group">
          <label className="form-label">City</label>
          <input
            type="text"
            name="city"
            className="form-input"
            placeholder="City name"
            value={formData.city}
            onChange={handleInputChange}
          />
        </div>
        {/* Interested Services */}
        <div className="form-group">
          <label className="form-label">Interested Services</label>
          {showSoundBoxBanner && (
            <div className="soundbox-banner">
              ℹ️ Sound Box automatically includes Current/Savings Account and UPI/QR Service
            </div>
          )}
          <div className="services-grid">
            {services.map(service => (
              <label key={service._id} className="service-checkbox">
                <input
                  type="checkbox"
                  checked={formData.interestedServices.includes(service._id)}
                  onChange={() => handleServiceToggle(service._id, service.slug)}
                />
                <span className="checkbox-label">{service.name}</span>
              </label>
            ))}
          </div>
        </div>
        {/* Notes */}
        <div className="form-group">
          <label className="form-label">Notes</label>
          <textarea
            name="notes"
            className="form-textarea"
            placeholder="Any additional information..."
            value={formData.notes}
            onChange={handleInputChange}
            rows="4"
          />
        </div>
        {/* Submit Button */}
        <button 
          type="submit" 
          className="btn-submit"
          disabled={loading}
        >
          {loading ? 'Adding Merchant...' : 'Add Merchant'}
        </button>
      </form>
    </div>
  );
}
export default AddMerchant;