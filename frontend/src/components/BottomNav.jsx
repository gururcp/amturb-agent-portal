import { useNavigate, useLocation } from 'react-router-dom';
import './BottomNav.css';
function BottomNav({ pendingCount = 0 }) {
  const navigate = useNavigate();
  const location = useLocation();
  const isActive = (path) => location.pathname === path;
  return (
    <nav className="bottom-nav">
      <button
        className={`nav-item ${isActive('/agent/dashboard') ? 'active' : ''}`}
        onClick={() => navigate('/agent/dashboard')}
      >
        <span className="nav-icon">🏠</span>
        <span className="nav-label">Home</span>
      </button>
      <button
        className={`nav-item ${isActive('/agent/merchants') ? 'active' : ''}`}
        onClick={() => navigate('/agent/merchants')}
      >
        <span className="nav-icon">📋</span>
        <span className="nav-label">Merchants</span>
        {pendingCount > 0 && (
          <span className="badge-dot"></span>
        )}
      </button>
      <button
        className="nav-item nav-item-center"
        onClick={() => navigate('/agent/add-merchant')}
      >
        <span className="nav-icon-large">+</span>
      </button>
      <button
        className={`nav-item ${isActive('/agent/followups') ? 'active' : ''}`}
        onClick={() => navigate('/agent/followups')}
      >
        <span className="nav-icon">📅</span>
        <span className="nav-label">Follow-ups</span>
        {pendingCount > 0 && (
          <span className="badge-dot"></span>
        )}
      </button>
      <button
        className={`nav-item ${isActive('/agent/profile') ? 'active' : ''}`}
        onClick={() => navigate('/agent/profile')}
      >
        <span className="nav-icon">👤</span>
        <span className="nav-label">Profile</span>
      </button>
    </nav>
  );
}
export default BottomNav;