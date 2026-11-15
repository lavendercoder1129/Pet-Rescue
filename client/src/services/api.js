import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  timeout: 15000,
  withCredentials: true, // Send HTTP-only cookies on cross-origin requests
});

// Interceptor to attach Authorization Bearer token as fallback
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('pet_rescue_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor for response error formatting
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const customError = {
      message:
        error.response?.data?.message ||
        error.message ||
        'An unexpected error occurred.',
      status: error.response?.status,
      data: error.response?.data,
    };
    return Promise.reject(customError);
  }
);

/**
 * Health check
 */
export const checkHealth = async () => {
  const response = await api.get('/health');
  return response.data;
};

/**
 * Authentication Endpoints
 */
export const registerUser = async (userData) => {
  const response = await api.post('/auth/register', userData);
  return response.data;
};

export const loginUser = async (credentials) => {
  const response = await api.post('/auth/login', credentials);
  return response.data;
};

export const getMeUser = async () => {
  const response = await api.get('/auth/me');
  return response.data;
};

export const logoutUser = async () => {
  const response = await api.post('/auth/logout');
  return response.data;
};

/**
 * Public Rescue Cases Endpoints
 */
export const getPublicCases = async (params = {}) => {
  const response = await api.get('/cases', { params });
  return response.data;
};

export const getPublicCaseById = async (id) => {
  const response = await api.get(`/cases/${id}`);
  return response.data;
};

/**
 * Rescuer Cases Endpoints
 */
export const createRescueCase = async (formData) => {
  // formData can be an instance of FormData for multipart file uploads
  const isMultipart = formData instanceof FormData;
  const config = isMultipart
    ? { headers: { 'Content-Type': 'multipart/form-data' } }
    : {};
  const response = await api.post('/cases', formData, config);
  return response.data;
};

export const getMyCases = async () => {
  const response = await api.get('/cases/my');
  return response.data;
};

/**
 * Admin Case Review Endpoints
 */
export const getAdminCases = async (params = {}) => {
  const response = await api.get('/cases/admin/all', { params });
  return response.data;
};

export const getAdminCaseById = async (id) => {
  const response = await api.get(`/cases/admin/${id}`);
  return response.data;
};

export const approveAdminCase = async (id, reviewNote) => {
  const response = await api.patch(`/cases/admin/${id}/approve`, { reviewNote });
  return response.data;
};

export const rejectAdminCase = async (id, reviewNote) => {
  const response = await api.patch(`/cases/admin/${id}/reject`, { reviewNote });
  return response.data;
};

export default api;
