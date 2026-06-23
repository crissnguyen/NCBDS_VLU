const trimTrailingSlash = (value) => String(value || '').replace(/\/+$/, '');

export const API_ORIGIN = trimTrailingSlash(
  import.meta.env.VITE_API_BASE_URL
  || (import.meta.env.DEV ? 'http://localhost:5001' : 'https://ncbds-vlu.onrender.com')
);

export const API_BASE = `${API_ORIGIN}/api`;

export const apiUrl = (path = '') => {
  const cleanPath = String(path).replace(/^\/+/, '');
  return `${API_BASE}/${cleanPath}`;
};

export const mediaUrl = (src) => {
  if (!src) return src;
  if (src.startsWith('http') || src.startsWith('data:image')) return src;
  return `${API_ORIGIN}${src.startsWith('/') ? src : `/${src}`}`;
};

export const isLocalApi = API_ORIGIN.includes('localhost') || API_ORIGIN.includes('127.0.0.1');
