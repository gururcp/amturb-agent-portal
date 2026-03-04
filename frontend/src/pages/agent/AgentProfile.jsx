import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';
import BottomNav from '../../components/BottomNav';
import './AgentProfile.css';
function AgentProfile() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    currentPin: '',
    newPin: '',
    confirmPin: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
    setSuccess('');
  };
  const handleChangePIN = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (formData.newPin.length < 4) {
      setError('New PIN must be at least 4 digits');
      return;
    }
    if (formData.newPin !== formData.confirmPin) {
      setError('New PIN and Confirm PIN do not match');
      return;
    }
    try {
      setLoading(true);
      await api.patch('/auth/change-pin', {
        currentPin: formData.currentPin,
        newPin: formData.newPin
      });
      setSuccess('PIN changed successfully');
      setFormData({ currentPin: '', newPin: '', confirmPin: '' });
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to change PIN');
    } finally {
      setLoading(false);
    }
  };
  const handleLogout = () => {
    logout();
    navigate('/login');
  };
  return (
    <div className="agent-profile-page">
      <header className="page-header">
        <h1>Profile</h1>
      </header>
      <div className="profile-content">
        {/* Profile Info */}
        <div className="profile-card">
          <div className="avatar-large">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <h2>{user?.name}</h2>
          <p className="employee-id">ID: {user?.employeeId}</p>
        </div>
        {/* Change PIN Form */}
        <div className="section-card">
          <h3>Change PIN</h3>
          {error && <div className="error-message">{error}</div>}
          {success && <div className="success-message">{success}</div>}
          <form onSubmit={handleChangePIN}>
            <div className="form-group">
              <label>Current PIN</label>
              <input
                type="password"
                name="currentPin"
                inputMode="numeric"
                pattern="[0-9]*"
                value={formData.currentPin}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="form-group">
              <label>New PIN</label>
              <input
                type="password"
                name="newPin"
                inputMode="numeric"
                pattern="[0-9]*"
                value={formData.newPin}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="form-group">
              <label>Confirm New PIN</label>
              <input
                type="password"
                name="confirmPin"
                inputMode="numeric"
                pattern="[0-9]*"
                value={formData.confirmPin}
                onChange={handleInputChange}
                required
              />
            </div>
            <button 
              type="submit" 
              className="btn-primary btn-full"
              disabled={loading}
            >
              {loading ? 'Changing PIN...' : 'Change PIN'}
            </button>
          </form>
        </div>
        {/* Logout Button */}
        <button 
          className="btn-logout"
          onClick={handleLogout}
        >
          Logout
        </button>
      </div>
      <BottomNav />
    </div>
  );
}
export default AgentProfile;