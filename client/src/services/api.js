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

export const resubmitRescueCase = async (id, data) => {
  const isMultipart = data instanceof FormData;
  const config = isMultipart
    ? { headers: { 'Content-Type': 'multipart/form-data' } }
    : {};
  const response = await api.patch(`/cases/${id}/resubmit`, data, config);
  return response.data;
};

/**
 * Admin Case Review Endpoints
 */
export const getAdminCaseStats = async () => {
  const response = await api.get('/admin/cases/stats');
  return response.data;
};

export const getAdminCases = async (params = {}) => {
  const response = await api.get('/admin/cases', { params });
  return response.data;
};

export const getAdminCaseById = async (id) => {
  const response = await api.get(`/admin/cases/${id}`);
  return response.data;
};

export const getCaseAuditHistory = async (id) => {
  const response = await api.get(`/admin/cases/${id}/history`);
  return response.data;
};

export const approveAdminCase = async (id, reviewNote) => {
  const response = await api.patch(`/admin/cases/${id}/approve`, { reviewNote });
  return response.data;
};

export const rejectAdminCase = async (id, reviewNote, rejectionReason) => {
  const response = await api.patch(`/admin/cases/${id}/reject`, {
    reviewNote,
    rejectionReason: rejectionReason || reviewNote,
  });
  return response.data;
};

/**
 * Donations Endpoints
 */
export const createDonation = async (donationData) => {
  const response = await api.post('/donations', donationData);
  return response.data;
};

export const getMyDonations = async (params = {}) => {
  const response = await api.get('/donations/my', { params });
  return response.data;
};

export const getDonationById = async (id) => {
  const response = await api.get(`/donations/${id}`);
  return response.data;
};

export const getAdminDonations = async (params = {}) => {
  const response = await api.get('/admin/donations', { params });
  return response.data;
};

export const getAdminDonationStats = async () => {
  const response = await api.get('/admin/donations/stats');
  return response.data;
};

/**
 * Transparency & Fund Allocation Endpoints
 */
export const getTransparencySummary = async () => {
  const response = await api.get('/transparency/summary');
  return response.data;
};

export const getTransparencyCases = async (params = {}) => {
  const response = await api.get('/transparency/cases', { params });
  return response.data;
};

export const getAdminFundsSummary = async () => {
  const response = await api.get('/admin/funds/summary');
  return response.data;
};

export const getAdminAllocations = async (params = {}) => {
  const response = await api.get('/admin/funds/allocations', { params });
  return response.data;
};

export const createFundAllocation = async (allocationData) => {
  const response = await api.post('/admin/funds/allocations', allocationData);
  return response.data;
};

export const getAdminCaseFinancials = async (caseId) => {
  const response = await api.get(`/admin/funds/cases/${caseId}`);
  return response.data;
};

/**
 * Expenses Endpoints (Module 8)
 */
export const submitExpense = async (formData) => {
  const response = await api.post('/expenses', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

export const getMyExpenses = async (params = {}) => {
  const response = await api.get('/expenses/my', { params });
  return response.data;
};

export const getExpenseById = async (id) => {
  const response = await api.get(`/expenses/${id}`);
  return response.data;
};

export const getAdminExpenses = async (params = {}) => {
  const response = await api.get('/admin/expenses', { params });
  return response.data;
};

export const getAdminExpenseById = async (id) => {
  const response = await api.get(`/admin/expenses/${id}`);
  return response.data;
};

export const approveAdminExpense = async (id, reviewNote) => {
  const response = await api.patch(`/admin/expenses/${id}/approve`, { reviewNote });
  return response.data;
};

export const rejectAdminExpense = async (id, reviewNote) => {
  const response = await api.patch(`/admin/expenses/${id}/reject`, { reviewNote });
  return response.data;
};

/**
 * Notifications Endpoints
 */
export const getNotifications = async () => {
  const response = await api.get('/notifications');
  return response.data;
};

export const markNotificationRead = async (id) => {
  const response = await api.patch(`/notifications/${id}/read`);
  return response.data;
};

export const markAllNotificationsRead = async () => {
  const response = await api.patch('/notifications/read-all');
  return response.data;
};

export default api;
