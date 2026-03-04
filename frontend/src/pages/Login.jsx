
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Login.css';
const Login = () => {
  const [employeeId, setEmployeeId] = useState('');
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!employeeId || !pin) {
      setError('Please enter both Employee ID and PIN');
      return;
    }
    setLoading(true);
    const result = await login(employeeId, pin);
    if (result.success) {
      // Check if must change PIN
      if (result.agent.mustChangePin) {
        navigate('/change-pin');
      } else {
        // Navigate based on role
        if (result.agent.role === 'owner') {
          navigate('/owner/dashboard');
        } else {
          navigate('/agent/dashboard');
        }
      }
    } else {
      setError(result.message);
      setLoading(false);
    }
  };
  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h1>Amravati Urban</h1>
          <p className="text-muted">Field Agent Portal</p>
        </div>
        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="employeeId">Employee ID</label>
            <input
              id="employeeId"
              type="text"
              value={employeeId}
              onChange={(e) => setEmployeeId(e.target.value.toUpperCase())}
              placeholder="Enter your Employee ID"
              autoComplete="username"
              autoFocus
              disabled={loading}
            />
          </div>
          <div className="form-group">
            <label htmlFor="pin">PIN</label>
            <input
              id="pin"
              type="password"
              inputMode="numeric"
              value={pin}
              onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
              placeholder="Enter your 4-digit PIN"
              maxLength="6"
              autoComplete="current-password"
              disabled={loading}
            />
          </div>
          {error && <p className="text-error">{error}</p>}
          <button 
            type="submit" 
            className="btn-primary btn-full"
            disabled={loading}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
        <div className="login-footer">
          <p className="text-muted">
            For support, contact your supervisor
          </p>
        </div>
      </div>
    </div>
  );
};
export default Login;