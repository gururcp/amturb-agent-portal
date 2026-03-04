import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';
import BottomNav from '../../components/BottomNav';
import './AgentDashboard.css';
function AgentDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    myTotal: 0,
    myOnboarded: 0,
    mySoundbox: 0,
    todayVisits: 0
  });
  const [overdueFollowups, setOverdueFollowups] = useState([]);
  const [todayFollowups, setTodayFollowups] = useState([]);
  const [merchants, setMerchants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedCard, setExpandedCard] = useState(null);
  const [noteText, setNoteText] = useState('');
  const [savingNote, setSavingNote] = useState(false);
  useEffect(() => {
    fetchDashboardData();
  }, []);
  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [dashResponse, merchantsResponse] = await Promise.all([
        api.get('/dashboard/agent'),
        api.get('/merchants?limit=20')
      ]);
      setStats(dashResponse.data);
      setOverdueFollowups(dashResponse.data.overdueFollowups || []);
      setTodayFollowups(dashResponse.data.todayFollowups || []);
      setMerchants(merchantsResponse.data.merchants || []);
    } catch (error) {
      console.error('Error fetching dashboard:', error);
    } finally {
      setLoading(false);
    }
  };
  const handleWhatsApp = async (merchant) => {
    // Open WhatsApp
    window.open(`https://wa.me/91${merchant.phone}`, '_blank');
    // Auto-update status to Contacted
    try {
      await api.patch(`/merchants/${merchant._id}/status`, { status: 'Contacted' });
      fetchDashboardData(); // Refresh data
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };
  const handleAddNote = async (merchantId) => {
    if (!noteText.trim()) return;
    try {
      setSavingNote(true);
      await api.post(`/merchants/${merchantId}/visit-log`, { note: noteText });
      setNoteText('');
      setExpandedCard(null);
      fetchDashboardData();
    } catch (error) {
      console.error('Error adding note:', error);
      alert('Failed to add note');
    } finally {
      setSavingNote(false);
    }
  };
  const toggleCard = (merchantId) => {
    if (expandedCard === merchantId) {
      setExpandedCard(null);
      setNoteText('');
    } else {
      setExpandedCard(merchantId);
    }
  };
  if (loading) {
    return (
      <div className="agent-dashboard">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading dashboard...</p>
        </div>
      </div>
    );
  }
  return (
    <div className="agent-dashboard">
      {/* Top Bar */}
      <header className="dashboard-header">
        <div className="header-left">
          <h1 className="wordmark">Amravati Urban</h1>
        </div>
        <div className="header-right">
          <div className="user-badge">
            <div className="avatar-circle">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <span className="user-name">{user?.name?.split(' ')[0]}</span>
          </div>
        </div>
      </header>
      {/* Stat Tiles - 2x2 Grid */}
      <section className="stat-grid">
        <div className="stat-tile">
          <div className="stat-number">{stats.myTotal}</div>
          <div className="stat-label">My Merchants</div>
        </div>
        <div className="stat-tile">
          <div className="stat-number">{stats.myOnboarded}</div>
          <div className="stat-label">Onboarded</div>
        </div>
        <div className="stat-tile stat-tile-soundbox">
          <div className="stat-number">{stats.mySoundbox}</div>
          <div className="stat-label">Sound Box Leads</div>
        </div>
        <div className="stat-tile">
          <div className="stat-number">{stats.todayVisits}</div>
          <div className="stat-label">Today's Visits</div>
        </div>
      </section>
      {/* Overdue Banner */}
      {overdueFollowups.length > 0 && (
        <section className="overdue-banner">
          <div className="banner-header">
            <strong>⚠️ You have {overdueFollowups.length} overdue follow-up{overdueFollowups.length > 1 ? 's' : ''}</strong>
          </div>
          <div className="overdue-list">
            {overdueFollowups.map(merchant => (
              <div key={merchant._id} className="overdue-item">
                <div className="overdue-info">
                  <div className="merchant-name">{merchant.businessName}</div>
                  <div className="overdue-days">{merchant.daysOverdue} days overdue</div>
                </div>
                <button 
                  className="btn-whatsapp-small"
                  onClick={() => handleWhatsApp(merchant)}
                >
                  WhatsApp
                </button>
              </div>
            ))}
          </div>
        </section>
      )}
      {/* Today's Follow-ups */}
      {todayFollowups.length > 0 && (
        <section className="today-followups">
          <h2 className="section-title">Today's Follow-ups</h2>
          <div className="followup-cards">
            {todayFollowups.map(merchant => (
              <div key={merchant._id} className="followup-card">
                <div className="followup-main">
                  <div className="followup-info">
                    <div className="business-name">{merchant.businessName}</div>
                    <div className="owner-name">{merchant.ownerName}</div>
                    {merchant.scheduledTime && (
                      <div className="scheduled-time">🕐 {merchant.scheduledTime}</div>
                    )}
                  </div>
                  <button 
                    className="btn-whatsapp"
                    onClick={() => handleWhatsApp(merchant)}
                  >
                    WhatsApp
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
      {/* My Merchants List */}
      <section className="merchants-section">
        <div className="section-header">
          <h2 className="section-title">My Merchants</h2>
          <button 
            className="btn-view-all"
            onClick={() => navigate('/agent/merchants')}
          >
            View All →
          </button>
        </div>
        <div className="merchant-cards">
          {merchants.map(merchant => (
            <div key={merchant._id} className="merchant-card">
              <div 
                className="merchant-card-main"
                onClick={() => toggleCard(merchant._id)}
              >
                <div className="merchant-info">
                  <div className="business-name">{merchant.businessName}</div>
                  <div className="owner-name">{merchant.ownerName}</div>
                  <div className="merchant-meta">
                    <span className="phone">📞 {merchant.phone}</span>
                    <span className={`status-badge status-${merchant.status.toLowerCase()}`}>
                      {merchant.status}
                    </span>
                  </div>
                  {merchant.nextVisitDate && (
                    <div className="next-visit">
                      Next visit: {new Date(merchant.nextVisitDate).toLocaleDateString('en-IN')}
                    </div>
                  )}
                  <div className="gps-label">
                    {merchant.gps_lat ? '📍 Geotagged ✓' : '📍 No GPS'}
                  </div>
                </div>
              </div>
              {/* Expanded Actions */}
              {expandedCard === merchant._id && (
                <div className="merchant-actions">
                  <div className="action-buttons">
                    <button 
                      className="btn-action btn-whatsapp"
                      onClick={() => handleWhatsApp(merchant)}
                    >
                      WhatsApp
                    </button>
                    <button 
                      className="btn-action btn-note"
                      onClick={() => {/* Note form will show below */}}
                    >
                      Add Note
                    </button>
                    <button 
                      className="btn-action btn-edit"
                      onClick={() => navigate(`/agent/merchants/${merchant._id}/edit`)}
                    >
                      Edit
                    </button>
                  </div>
                  {/* Inline Note Form */}
                  <div className="note-form">
                    <textarea
                      placeholder="Add a visit note..."
                      value={noteText}
                      onChange={(e) => setNoteText(e.target.value)}
                      rows="3"
                    />
                    <button 
                      className="btn-save-note"
                      onClick={() => handleAddNote(merchant._id)}
                      disabled={savingNote || !noteText.trim()}
                    >
                      {savingNote ? 'Saving...' : 'Save Note'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>
      {/* FAB Button */}
      <button 
        className="fab-button"
        onClick={() => navigate('/agent/add-merchant')}
        aria-label="Add Merchant"
      >
        +
      </button>
      {/* Bottom Navigation */}
      <BottomNav 
        pendingCount={overdueFollowups.length + todayFollowups.length}
      />
    </div>
  );
}
export default AgentDashboard;