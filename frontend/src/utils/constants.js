// Brand Colors (from Section 3 of your document)
export const COLORS = {
  navy: '#032360',
  red: '#be0003',
  white: '#ffffff',
  lightGray: '#f5f5f5',
  gray: '#888888',
  darkGray: '#333333',
  borderGray: '#e0e0e0',
  green: '#10b981',
  amber: '#f59e0b'
};
// Status Colors
export const STATUS_COLORS = {
  new: COLORS.lightGray,
  contacted: COLORS.lightGray,
  interested: '#fff7ed',
  onboarded: COLORS.navy
};
// Status Labels
export const STATUS_LABELS = {
  new: 'New',
  contacted: 'Contacted',
  interested: 'Interested',
  onboarded: 'Onboarded'
};
// Routes (from Section 17 of your document)
export const ROUTES = {
  LOGIN: '/login',
  CHANGE_PIN: '/change-pin',
  AGENT_DASHBOARD: '/agent/dashboard',
  AGENT_MERCHANTS: '/agent/merchants',
  AGENT_FOLLOWUPS: '/agent/followups',
  AGENT_PROFILE: '/agent/profile',
  OWNER_DASHBOARD: '/owner/dashboard',
  OWNER_MERCHANTS: '/owner/merchants',
  OWNER_FOLLOWUPS: '/owner/followups',
  OWNER_SERVICES: '/owner/services',
  OWNER_TEAM: '/owner/team',
  OWNER_REPORTS: '/owner/reports'
};