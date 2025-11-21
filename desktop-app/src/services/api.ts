import axios, { AxiosInstance, AxiosError } from 'axios';
import { useAuthStore } from '../stores/authStore';

// API Base URL - change this in production
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';

// Create axios instance
const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - add auth token
api.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().accessToken;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as any;

    // If 401 and not already retried, try to refresh token
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = useAuthStore.getState().refreshToken;
        if (refreshToken) {
          const response = await axios.post(`${API_BASE_URL}/auth/refresh-token`, {
            refreshToken,
          });

          const { accessToken, refreshToken: newRefreshToken } = response.data;
          useAuthStore.getState().updateTokens(accessToken, newRefreshToken);

          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        // Refresh failed, logout user
        useAuthStore.getState().logout();
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// ============================================================================
// AUTH API
// ============================================================================

export const authAPI = {
  staffLogin: async (email: string, password: string) => {
    const response = await api.post('/auth/staff/login', { email, password });
    return response.data;
  },

  logout: async () => {
    const response = await api.post('/auth/logout');
    return response.data;
  },

  refreshToken: async (refreshToken: string) => {
    const response = await api.post('/auth/refresh-token', { refreshToken });
    return response.data;
  },

  validateKey: async (registrationKey: string) => {
    const response = await api.post('/auth/validate-key', { registration_key: registrationKey });
    return response.data;
  },
};

// ============================================================================
// PATIENTS API
// ============================================================================

export interface CreatePatientData {
  facility_id: string;
  first_name: string;
  last_name: string;
  date_of_birth: string;
  phone?: string;
  email?: string;
  sobriety_date?: string;
  assigned_counselor_id?: string;
  substances_of_choice?: string[];
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  emergency_contact_relationship?: string;
}

export interface PatientFilters {
  status?: string;
  counselor_id?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export const patientsAPI = {
  getAll: async (filters: PatientFilters = {}) => {
    const params = new URLSearchParams();
    if (filters.status) params.append('status', filters.status);
    if (filters.counselor_id) params.append('counselor_id', filters.counselor_id);
    if (filters.search) params.append('search', filters.search);
    if (filters.page) params.append('page', String(filters.page));
    if (filters.limit) params.append('limit', String(filters.limit));

    const response = await api.get(`/patients?${params.toString()}`);
    return response.data;
  },

  getById: async (id: string) => {
    const response = await api.get(`/patients/${id}`);
    return response.data;
  },

  getDashboard: async (id: string) => {
    const response = await api.get(`/patients/${id}/dashboard`);
    return response.data;
  },

  create: async (data: CreatePatientData) => {
    const response = await api.post('/patients', data);
    return response.data;
  },

  update: async (id: string, data: Partial<CreatePatientData>) => {
    const response = await api.put(`/patients/${id}`, data);
    return response.data;
  },

  delete: async (id: string) => {
    const response = await api.delete(`/patients/${id}`);
    return response.data;
  },

  regenerateKey: async (id: string) => {
    const response = await api.post(`/patients/${id}/regenerate-key`);
    return response.data;
  },
};

// ============================================================================
// MESSAGES API
// ============================================================================

export interface SendMessageData {
  recipient_id: string;
  subject?: string;
  body: string;
  message_type?: string;
  priority?: string;
}

export const messagesAPI = {
  getAll: async (page: number = 1, limit: number = 50) => {
    const response = await api.get(`/messages?page=${page}&limit=${limit}`);
    return response.data;
  },

  getConversation: async (patientId: string) => {
    const response = await api.get(`/conversations/${patientId}`);
    return response.data;
  },

  send: async (data: SendMessageData) => {
    const response = await api.post('/messages', data);
    return response.data;
  },

  markAsRead: async (messageId: string) => {
    const response = await api.put(`/messages/${messageId}/read`);
    return response.data;
  },
};

// ============================================================================
// FACILITY API
// ============================================================================

export const facilityAPI = {
  getDashboard: async (facilityId: string) => {
    const response = await api.get(`/facilities/${facilityId}/dashboard`);
    return response.data;
  },

  getStaff: async (facilityId: string) => {
    const response = await api.get(`/facilities/${facilityId}/staff`);
    return response.data;
  },
};

// ============================================================================
// HEALTH CHECK
// ============================================================================

export const healthCheck = async () => {
  try {
    const response = await api.get('/health');
    return response.data;
  } catch (error) {
    return { status: 'error', message: 'Cannot connect to server' };
  }
};

export default api;
