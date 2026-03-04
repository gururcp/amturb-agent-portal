import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { merchantAPI } from '../../services/api';
import { STATUS_COLORS, STATUS_LABELS } from '../../utils/constants';
const MerchantList = ({ merchants }) => {
  const [expandedId, setExpandedId] = useState(null);
  const navigate = useNavigate();
  const handleWhatsApp = (phone) => {
    window.open(`https://wa.me/91${phone}`, '_blank');
  };
  const handleAddNote = (merchantId) => {
    // We'll implement this when we build the merchant detail page
    navigate(`/agent/merchants/${merchantId}`);
  };
  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };
  return (
    <div className="merchant-list">
      {merchants.map((merchant) => (
        <div key={merchant._id} className="merchant-card">
          <div className="merchant-header" onClick={() => toggleExpand(merchant._id)}>
            <div className="merchant-info">
              <div className="merchant-name">{merchant.businessName}</div>
              <div className="merchant-owner">{merchant.ownerName}</div>
            </div>
            <div className="merchant-status">
              <span className={`badge badge-${merchant.status}`}
                    style={{ backgroundColor: STATUS_COLORS[merchant.status] }}>
                {STATUS_LABELS[merchant.status]}
              </span>
            </div>
          </div>
          {expandedId === merchant._id && (
            <div className="merchant-actions">
              <button
                onClick={() => handleWhatsApp(merchant.phone)}
                className="btn-secondary"
              >
                WhatsApp
              </button>
              <button
                onClick={() => handleAddNote(merchant._id)}
                className="btn-primary"
              >
                Add Note
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};
export default MerchantList;