import { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axios';
const AuthContext = createContext();
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isOwner, setIsOwner] = useState(false);
  useEffect(() => {
    checkAuth();
  }, []);
  const checkAuth = async () => {
    const token = localStorage.getItem('au_token');
    if (!token) {
      setLoading(false);
      return;
    }
    try {
      const response = await api.get('/auth/me');
      const userData = response.data;
      setUser(userData);
      setIsAuthenticated(true);
      setIsOwner(userData.role === 'owner');
    } catch (error) {
      console.error('Auth check failed:', error);
      localStorage.removeItem('au_token');
      setUser(null);
      setIsAuthenticated(false);
      setIsOwner(false);
    } finally {
      setLoading(false);
    }
  };
  const login = async (employeeId, pin) => {
    try {
      const response = await api.post('/auth/login', { employeeId, pin });
      const token = response.data.token;
      const userData = response.data.user;
      if (!token || !userData) {
        throw new Error('Invalid login response');
      }
      localStorage.setItem('au_token', token);
      setUser(userData);
      setIsAuthenticated(true);
      setIsOwner(userData.role === 'owner');
      return { user: userData, token };
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };
  const logout = () => {
    localStorage.removeItem('au_token');
    setUser(null);
    setIsAuthenticated(false);
    setIsOwner(false);
  };
  const updateUser = (userData) => {
    setUser(prev => ({ ...prev, ...userData }));
  };
  return (
    <AuthContext.Provider value={{
      user,
      loading,
      isAuthenticated,
      isOwner,
      login,
      logout,
      updateUser,
      checkAuth
    }}>
      {children}
    </AuthContext.Provider>
  );
}
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}