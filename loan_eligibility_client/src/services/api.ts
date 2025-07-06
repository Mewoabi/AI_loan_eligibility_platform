import axios from 'axios';

const API_URL = 'http://localhost:8000';

// Create axios instance with base URL
const api = axios.create({
  baseURL: API_URL,
});
// Add request interceptor for JWT authentication
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);
// Authentication API calls
export const registerUser = async (email: string, password: string) => {
  try {
    return api.post('/auth/register', { email, password });
  } catch (error) {
    console.log("error registering user", error)
    throw error
  }
};

export const loginUser = async (username: string, password: string) => {
  const formData = new FormData();
  formData.append('username', username);
  formData.append('password', password);
  try {
    const response = await api.post('/auth/token', formData);
    console.log('Login response:', response.data);
    return response;
  } catch (error) {
    console.error('Login error:', error);
    throw error;
    
  }
};
export const getCurrentUser = async () => {
  try {
    return await api.get('/users/me');
  } catch (error) {
    console.log("something went wrong getting the current user", error)
    throw error
  }
};
// Profile API calls
export const getProfile = async () => {
  return api.get('/users/profile');
};
export const createProfile = async (profileData: any) => {
  return api.post('/users/profile', profileData);
};

export const updateProfile = async (profileData: any) => {
  return api.put('/users/profile', profileData);
};

// User search and management
export const searchUsers = async (query: string) => {
  return api.get(`/users/search?q=${encodeURIComponent(query)}`);
};

export const getUserById = async (userId: string) => {
  return api.get(`/users/${userId}`);
};

// Credit Scoring API calls
export const performCreditScore = async (scoreData: any) => {
  return api.post('/loans/predict', scoreData);
};

export const saveScoreResult = async (scoreData: any) => {
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

export const updateScoreStatus = async (scoreId: string, statusData: any) => {
  return api.put(`/scoring/${scoreId}/status`, statusData);
};

// Loan tracking API calls
export const recordLoanTaken = async (scoreId: string, loanData: any) => {
  return api.post(`/loans/record/${scoreId}`, loanData);
};

export const updateLoanRepaymentStatus = async (loanId: string, statusData: any) => {
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

// Dashboard statistics
export const getDashboardStats = async () => {
  return api.get('/dashboard/stats');
};

// Legacy API calls for backward compatibility (to be removed)
export const predictLoanEligibility = async (loanData: any) => {
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

export const updateLoanApplication = async (loanId: string, updateData: any) => {
  return updateScoreStatus(loanId, updateData);
};

export const createLoanApplication = async (loanData: any) => {
  return performCreditScore(loanData);
};

export const deleteLoanApplication = async (loanId: string) => {
  return api.delete(`/scoring/${loanId}`);
};

export default api;