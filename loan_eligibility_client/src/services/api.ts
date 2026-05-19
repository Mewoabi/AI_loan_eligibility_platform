import axios from 'axios';
import { DEFAULT_TIMEOUT_MS, getApiErrorMessage } from './apiErrors';

const API_URL = import.meta.env.VITE_API_URL;

const api = axios.create({
  baseURL: API_URL,
  timeout: DEFAULT_TIMEOUT_MS,
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (axios.isAxiosError(error) && error.response?.data && typeof error.response.data === 'object') {
      const data = error.response.data as { detail?: unknown };
      // Keep FastAPI validation arrays intact; normalize everything else
      if (!Array.isArray(data.detail)) {
        data.detail = getApiErrorMessage(error, 'Something went wrong');
      }
    }
    return Promise.reject(error);
  }
);

export { getApiErrorMessage };

export const registerUser = async (email: string, password: string) => {
  return api.post('/auth/register', { email, password });
};

export const loginUser = async (username: string, password: string) => {
  const formData = new FormData();
  formData.append('username', username);
  formData.append('password', password);
  return api.post('/auth/token', formData);
};

export const getCurrentUser = async () => {
  return api.get('/users/me');
};

export const getProfile = async () => {
  return api.get('/users/profile');
};

export const createProfile = async (profileData: unknown) => {
  return api.post('/users/profile', profileData);
};

export const updateProfile = async (profileData: unknown) => {
  return api.put('/users/profile', profileData);
};

export const searchUsers = async (query: string) => {
  return api.get(`/users/search?q=${encodeURIComponent(query)}`);
};

export const getUserById = async (userId: string) => {
  return api.get(`/users/${userId}`);
};

export const performCreditScore = async (scoreData: unknown) => {
  return api.post('/loans/predict', scoreData);
};

export const saveScoreResult = async (scoreData: unknown) => {
  return api.post('/scoring/save', scoreData);
};

export const getMyScores = async () => {
  return api.get('/scoring/my-scores');
};

export const getScoresOnMe = async () => {
  return api.get('/scoring/scores-on-me');
};

export const getScoreById = async (scoreId: string) => {
  return api.get(`/scoring/${scoreId}`);
};

export const updateScoreStatus = async (scoreId: string, statusData: unknown) => {
  return api.put(`/scoring/${scoreId}/status`, statusData);
};

export const recordLoanTaken = async (scoreId: string, loanData: unknown) => {
  return api.post(`/loans/record/${scoreId}`, loanData);
};

export const updateLoanRepaymentStatus = async (loanId: string, statusData: unknown) => {
  return api.put(`/loans/${loanId}/repayment`, statusData);
};

export const getMyLoans = async () => {
  return api.get('/loans/my-loans');
};

export const getLoansIScored = async () => {
  return api.get('/loans/loans-i-scored');
};

export const getLoanById = async (loanId: string) => {
  return api.get(`/loans/${loanId}`);
};

export const getDashboardStats = async () => {
  return api.get('/dashboard/stats');
};

export const predictLoanEligibility = async (loanData: unknown) => {
  return performCreditScore(loanData);
};

export const getUserLoanApplications = async () => {
  return getMyScores();
};

export const getPendingLoanApplications = async () => {
  return api.get('/scoring/pending');
};

export const getScoredLoanApplications = async () => {
  return api.get('/scoring/completed');
};

export const getLoanApplication = async (loanId: string) => {
  return getScoreById(loanId);
};

export const updateLoanApplication = async (loanId: string, updateData: unknown) => {
  return updateScoreStatus(loanId, updateData);
};

export const createLoanApplication = async (loanData: unknown) => {
  return performCreditScore(loanData);
};

export const deleteLoanApplication = async (loanId: string) => {
  return api.delete(`/scoring/${loanId}`);
};

export default api;
