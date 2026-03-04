import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
function ProtectedRoute({ children, requireOwner = false }) {
  const { isAuthenticated, isOwner, user, loading } = useAuth();
  const location = useLocation();
  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh' 
      }}>
        <div className="spinner"></div>
      </div>
    );
  }
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  // Check if PIN change is required (but not if already on change-pin page)
  if (user?.mustChangePIN && location.pathname !== '/change-pin') {
    return <Navigate to="/change-pin" replace />;
  }
  // Check owner access
  if (requireOwner && !isOwner) {
    return <Navigate to="/agent/dashboard" replace />;
  }
  // Check agent trying to access owner pages
  if (location.pathname.startsWith('/owner') && !isOwner) {
    return <Navigate to="/agent/dashboard" replace />;
  }
  return children;
}
export default ProtectedRoute;