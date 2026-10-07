import { API_BASE } from '../api';

export const CONFIG = {
  // Chế độ chạy: 'api' gọi backend theo VITE_API_BASE_URL; 'local' chỉ dùng localStorage để test UI offline.
  MODE: import.meta.env.VITE_DATA_MODE || 'api',
  API_BASE,
  LOCAL_KEYS: {
    NEWS: 'local_news_db',
    PROPERTIES: 'local_properties_db',
    CONTACTS: 'local_contacts_db',
    LEADS: 'local_leads_db'
  }
};
