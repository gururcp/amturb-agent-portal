import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import BottomNav from '../../components/BottomNav';
import './AgentMerchants.css';
function AgentMerchants() {
  const navigate = useNavigate();
  const [merchants, setMerchants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  useEffect(() => {
    fetchMerchants();
  }, [statusFilter]);
  const fetchMerchants = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (statusFilter) params.append('status', statusFilter);
      if (searchTerm) params.append('search', searchTerm);
      const response = await api.get(`/merchants?${params.toString()}`);
      setMerchants(response.data.merchants || []);
    } catch (error) {
      console.error('Error fetching merchants:', error);
    } finally {
      setLoading(false);
    }
  };
  const handleSearch = (e) => {
    e.preventDefault();
    fetchMerchants();
  };
  const handleWhatsApp = async (merchant) => {
    window.open(`https://wa.me/91${merchant.phone}`, '_blank');
    try {
      await api.patch(`/merchants/${merchant._id}/status`, { status: 'Contacted' });
      fetchMerchants();
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };
  return (
    <div className="agent-merchants-page">
      <header className="page-header">
        <h1>My Merchants</h1>
        <div className="header-stats">
          <span>{merchants.length} total</span>
        </div>
      </header>
      {/* Search & Filter */}
      <div className="search-filter-bar">
        <form onSubmit={handleSearch} className="search-form">
          <input
            type="text"
            placeholder="Search by name or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          <button type="submit" className="search-btn">Search</button>
        </form>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="filter-select"
        >
          <option value="">All Status</option>
          <option value="New">New</option>
          <option value="Contacted">Contacted</option>
          <option value="Onboarded">Onboarded</option>
        </select>
      </div>
      {/* Merchants List */}
      {loading ? (
        <div className="loading-container">
          <div className="spinner"></div>
        </div>
      ) : merchants.length === 0 ? (
        <div className="empty-state">
          <p>No merchants found</p>
          <button 
            className="btn-primary"
            onClick={() => navigate('/agent/add-merchant')}
          >
            Add Your First Merchant
          </button>
        </div>
      ) : (
        <div className="merchants-list">
          {merchants.map(merchant => (
            <div key={merchant._id} className="merchant-card">
              <div className="merchant-header">
                <div className="merchant-info">
                  <h3>{merchant.businessName}</h3>
                  <p className="owner-name">{merchant.ownerName}</p>
                  <p className="phone">📞 {merchant.phone}</p>
                </div>
                <span className={`status-badge status-${merchant.status.toLowerCase()}`}>
                  {merchant.status}
                </span>
              </div>
              {merchant.address && (
                <p className="address">📍 {merchant.address}</p>
              )}
              {merchant.nextVisitDate && (
                <p className="next-visit">
                  Next visit: {new Date(merchant.nextVisitDate).toLocaleDateString('en-IN')}
                </p>
              )}
              <div className="card-actions">
                <button
                  className="btn-action btn-whatsapp"
                  onClick={() => handleWhatsApp(merchant)}
                >
                  WhatsApp
                </button>
                <button
                  className="btn-action btn-view"
                  onClick={() => navigate(`/agent/merchants/${merchant._id}`)}
                >
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
      <BottomNav />
    </div>
  );
}
export default AgentMerchants;