
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../services/api';
import './ChangePin.css';
const ChangePin = () => {
  const [currentPin, setCurrentPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { agent, updateAgent, isOwner } = useAuth();
  const navigate = useNavigate();
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    // Validation
    if (!currentPin || !newPin || !confirmPin) {
      setError('All fields are required');
      return;
    }
    if (newPin.length < 4 || newPin.length > 6) {
      setError('New PIN must be 4-6 digits');
      return;
    }
    if (newPin === currentPin) {
      setError('New PIN must be different from current PIN');
      return;
    }
    if (newPin !== confirmPin) {
      setError('New PIN and Confirm PIN do not match');
      return;
    }
    setLoading(true);
    try {
      await authAPI.changePin({ currentPin, newPin });
      // Update agent in context
      updateAgent({ mustChangePin: false });
      // Navigate to dashboard
      if (isOwner) {
        navigate('/owner/dashboard');
      } else {
        navigate('/agent/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to change PIN');
      setLoading(false);
    }
  };
  return (
    <div className="change-pin-container">
      <div className="change-pin-card">
        <div className="change-pin-header">
          <h1>Change Your PIN</h1>
          <p className="text-muted">
            {agent?.mustChangePin 
              ? 'For security, please change your PIN before continuing'
              : 'Update your PIN'
            }
          </p>
        </div>
        <form onSubmit={handleSubmit} className="change-pin-form">
          <div className="form-group">
            <label htmlFor="currentPin">Current PIN</label>
            <input
              id="currentPin"
              type="password"
              inputMode="numeric"
              value={currentPin}
              onChange={(e) => setCurrentPin(e.target.value.replace(/\D/g, ''))}
              placeholder="Enter current PIN"
              maxLength="6"
              autoFocus
              disabled={loading}
            />
          </div>
          <div className="form-group">
            <label htmlFor="newPin">New PIN (4-6 digits)</label>
            <input
              id="newPin"
              type="password"
              inputMode="numeric"
              value={newPin}
              onChange={(e) => setNewPin(e.target.value.replace(/\D/g, ''))}
              placeholder="Enter new PIN"
              maxLength="6"
              disabled={loading}
            />
          </div>
          <div className="form-group">
            <label htmlFor="confirmPin">Confirm New PIN</label>
            <input
              id="confirmPin"
              type="password"
              inputMode="numeric"
              value={confirmPin}
              onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, ''))}
              placeholder="Re-enter new PIN"
              maxLength="6"
              disabled={loading}
            />
          </div>
          {error && <p className="text-error">{error}</p>}
          <button 
            type="submit" 
            className="btn-primary btn-full"
            disabled={loading}
          >
            {loading ? 'Changing PIN...' : 'Change PIN'}
          </button>
        </form>
      </div>
    </div>
  );
};
export default ChangePin;