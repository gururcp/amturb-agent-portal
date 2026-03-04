import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import LoadingSpinner from './components/LoadingSpinner';
import Login from './pages/Login';
import ChangePin from './pages/ChangePin';
import AgentDashboard from './pages/agent/AgentDashboard';
import AddMerchant from './pages/agent/AddMerchant';
import AgentMerchants from './pages/agent/AgentMerchants';
import AgentFollowups from './pages/agent/AgentFollowups';
import AgentProfile from './pages/agent/AgentProfile';
import OwnerDashboard from './pages/owner/OwnerDashboard';
function App() {
  const { loading, isAuthenticated, isOwner } = useAuth();
  if (loading) {
    return <LoadingSpinner message="Loading portal..." />;
  }
  return (
    <Routes>
      {/* Public Routes */}
      <Route
        path="/login"
        element={
          isAuthenticated ? (
            <Navigate to={isOwner ? '/owner/dashboard' : '/agent/dashboard'} replace />
          ) : (
            <Login />
          )
        }
      />
      {/* Change PIN Route */}
      <Route
        path="/change-pin"
        element={
          <ProtectedRoute>
            <ChangePin />
          </ProtectedRoute>
        }
      />
      {/* Agent Routes */}
      <Route
        path="/agent/dashboard"
        element={
          <ProtectedRoute>
            <AgentDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/agent/add-merchant"
        element={
          <ProtectedRoute>
            <AddMerchant />
          </ProtectedRoute>
        }
      />
      <Route
        path="/agent/merchants"
        element={
          <ProtectedRoute>
            <AgentMerchants />
          </ProtectedRoute>
        }
      />
      <Route
        path="/agent/followups"
        element={
          <ProtectedRoute>
            <AgentFollowups />
          </ProtectedRoute>
        }
      />
      <Route
        path="/agent/profile"
        element={
          <ProtectedRoute>
            <AgentProfile />
          </ProtectedRoute>
        }
      />
      {/* Owner Routes */}
      <Route
        path="/owner/dashboard"
        element={
          <ProtectedRoute requireOwner>
            <OwnerDashboard />
          </ProtectedRoute>
        }
      />
      {/* Default redirect */}
      <Route
        path="/"
        element={
          isAuthenticated ? (
            <Navigate to={isOwner ? '/owner/dashboard' : '/agent/dashboard'} replace />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />
      {/* 404 */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
export default App;