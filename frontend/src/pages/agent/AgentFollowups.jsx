import { useState, useEffect } from 'react';
import api from '../../api/axios';
import BottomNav from '../../components/BottomNav';
import './AgentFollowups.css';
function AgentFollowups() {
  const [activeTab, setActiveTab] = useState('overdue');
  const [followups, setFollowups] = useState({
    overdue: [],
    today: [],
    thisWeek: []
  });
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    fetchFollowups();
  }, []);
  const fetchFollowups = async () => {
    try {
      setLoading(true);
      const response = await api.get('/followups');
      setFollowups(response.data);
    } catch (error) {
      console.error('Error fetching followups:', error);
    } finally {
      setLoading(false);
    }
  };
  const handleWhatsApp = async (merchant) => {
    window.open(`https://wa.me/91${merchant.phone}`, '_blank');
    try {
      await api.patch(`/merchants/${merchant._id}/status`, { status: 'Contacted' });
      fetchFollowups();
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };
  const currentList = followups[activeTab] || [];
  return (
    <div className="agent-followups-page">
      <header className="page-header">
        <h1>Follow-ups</h1>
      </header>
      {/* Tabs */}
      <div className="tabs-container">
        <button
          className={`tab ${activeTab === 'overdue' ? 'active' : ''}`}
          onClick={() => setActiveTab('overdue')}
        >
          Overdue
          {followups.overdue.length > 0 && (
            <span className="badge">{followups.overdue.length}</span>
          )}
        </button>
        <button
          className={`tab ${activeTab === 'today' ? 'active' : ''}`}
          onClick={() => setActiveTab('today')}
        >
          Today
          {followups.today.length > 0 && (
            <span className="badge">{followups.today.length}</span>
          )}
        </button>
        <button
          className={`tab ${activeTab === 'thisWeek' ? 'active' : ''}`}
          onClick={() => setActiveTab('thisWeek')}
        >
          This Week
          {followups.thisWeek.length > 0 && (
            <span className="badge">{followups.thisWeek.length}</span>
          )}
        </button>
      </div>
      {/* List */}
      {loading ? (
        <div className="loading-container">
          <div className="spinner"></div>
        </div>
      ) : currentList.length === 0 ? (
        <div className="empty-state">
          <p>No follow-ups for this period</p>
        </div>
      ) : (
        <div className="followups-list">
          {currentList.map(merchant => (
            <div key={merchant._id} className="followup-card">
              <div className="followup-info">
                <h3>{merchant.businessName}</h3>
                <p className="owner-name">{merchant.ownerName}</p>
                <p className="phone">📞 {merchant.phone}</p>
                {merchant.nextVisitDate && (
                  <p className="visit-date">
                    📅 {new Date(merchant.nextVisitDate).toLocaleDateString('en-IN')}
                  </p>
                )}
                {merchant.daysOverdue && (
                  <p className="days-overdue">
                    ⚠️ {merchant.daysOverdue} days overdue
                  </p>
                )}
              </div>
              <button
                className="btn-whatsapp"
                onClick={() => handleWhatsApp(merchant)}
              >
                WhatsApp
              </button>
            </div>
          ))}
        </div>
      )}
      <BottomNav />
    </div>
  );
}
export default AgentFollowups;