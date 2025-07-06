import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { ReactNode } from 'react';
import * as api from '../services/api';
import { useAuth } from './AuthContext';
import { useToast } from './toastContext';
import { Gender, MaritalStatus, Education, EmploymentStatus, PropertyArea, DecisionStatus, LoanOutcome } from '../types/enums';

// Types for the data structures
export interface Profile {
  id: string;
  userId: string;
  fullName: string;
  nationalId: string;
  gender: Gender;
  maritalStatus: MaritalStatus;
  dependents: number;
  education: Education;
  employmentStatus: EmploymentStatus;
  income: number;
  coApplicantIncome: number;
  creditHistory: boolean;
  bankTransactions: string;
  lendingHistory: string;
  loanPurpose: string;
  propertyArea: PropertyArea;
  createdAt: string;
  updatedAt: string;
}

export interface DashboardStats {
  totalScoresPerformed: number;
  totalScoresReceived: number;
  totalLoansTracked: number;
  successfulRepayments: number;
  pendingLoans: number;
  recentScores: Array<{
    id: string;
    scoredUserName: string;
    score: number;
    date: string;
    decisionStatus: string;
  }>;
}

export interface Score {
  id: string;
  scoreduserId: string;
  scorerId?: string;
  amount: number;
  term: number;
  gender: Gender;
  maritalStatus: MaritalStatus;
  dependents: number;
  education: Education;
  employmentStatus: EmploymentStatus;
  income: number;
  coApplicantIncome: number;
  creditHistory: boolean;
  propertyArea: PropertyArea;
  score?: number;
  eligible?: boolean;
  decisionStatus?: DecisionStatus;
  awardedAmount?: number;
  dueDate?: string;
  outcomeStatus?: LoanOutcome;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  scoreData?: Record<string, any>;
}

export interface User {
  id: string;
  email: string;
  fullName: string;
  profile?: {
    gender: string;
    maritalStatus: string;
    dependents: number;
    education: string;
    employmentStatus: string;
    income: number;
    creditHistory: boolean;
    bankTransactions: string;
    lendingHistory: string;
    loanPurpose: string;
    propertyArea: string;
  };
}

interface LoadingState {
  profile: boolean;
  dashboardStats: boolean;
  myScores: boolean;
  scoresOnMe: boolean;
  users: boolean;
  initial: boolean; // New field for initial loading
  createProfile: boolean; // Loading state for profile creation
}

interface ErrorState {
  profile: string | null;
  dashboardStats: string | null;
  myScores: string | null;
  scoresOnMe: string | null;
  users: string | null;
  initial: string | null; // New field for initial loading errors
}

interface DataContextType {
  // Data
  profile: Profile | null;
  dashboardStats: DashboardStats | null;
  myScores: Score[];
  scoresOnMe: Score[];
  users: User[];
  
  // Loading states
  loading: LoadingState;
  
  // Error states
  error: ErrorState;
  
  // Fetch functions
  fetchProfile: () => Promise<void>;
  fetchDashboardStats: () => Promise<void>;
  fetchMyScores: () => Promise<void>;
  fetchScoresOnMe: () => Promise<void>;
  fetchUsers: () => Promise<void>;
  
  // Mutator functions (write operations)
  updateProfile: (profileData: any) => Promise<void>;
  createProfile: (profileData: any) => Promise<void>;
  saveScore: (scoreData: any) => Promise<void>;
  updateScoreStatus: (scoreId: string, statusData: any) => Promise<void>;
  deleteScore: (scoreId: string) => Promise<void>;
  
  // Utility functions
  refreshAllData: () => Promise<void>;
  clearData: () => void;
  getUserById: (id: string) => User | undefined;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const useData = (): DataContextType => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user: currentUser } = useAuth();
  const { showToast } = useToast();
  
  // Data state
  const [profile, setProfile] = useState<Profile | null>(null);
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);
  const [myScores, setMyScores] = useState<Score[]>([]);
  const [scoresOnMe, setScoresOnMe] = useState<Score[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  
  // Loading state
  const [loading, setLoading] = useState<LoadingState>({
    profile: false,
    dashboardStats: false,
    myScores: false,
    scoresOnMe: false,
    users: false,
    initial: false,
    createProfile: false,
  });
  
  // Error state
  const [error, setError] = useState<ErrorState>({
    profile: null,
    dashboardStats: null,
    myScores: null,
    scoresOnMe: null,
    users: null,
    initial: null,
  });

  // Fetch functions
  const fetchProfile = useCallback(async () => {
    if (!currentUser) return;
    
    setLoading(prev => ({ ...prev, profile: true }));
    setError(prev => ({ ...prev, profile: null }));
    
    try {
      const response = await api.getProfile();
      setProfile(response.data);
    } catch (err: any) {
      const errorMessage = err.response?.data?.detail || 'Failed to fetch profile';
      setError(prev => ({ ...prev, profile: errorMessage }));
      console.error('Failed to fetch profile:', err);
    } finally {
      setLoading(prev => ({ ...prev, profile: false }));
    }
  }, [currentUser]);

  const fetchDashboardStats = useCallback(async () => {
    if (!currentUser) return;
    
    setLoading(prev => ({ ...prev, dashboardStats: true }));
    setError(prev => ({ ...prev, dashboardStats: null }));
    
    try {
      const response = await api.getDashboardStats();
      setDashboardStats(response.data);
    } catch (err: any) {
      const errorMessage = err.response?.data?.detail || 'Failed to fetch dashboard stats';
      setError(prev => ({ ...prev, dashboardStats: errorMessage }));
      console.error('Failed to fetch dashboard stats:', err);
    } finally {
      setLoading(prev => ({ ...prev, dashboardStats: false }));
    }
  }, [currentUser]);

  const fetchMyScores = useCallback(async () => {
    if (!currentUser) return;
    
    setLoading(prev => ({ ...prev, myScores: true }));
    setError(prev => ({ ...prev, myScores: null }));
    
    try {
      const response = await api.getMyScores();
      setMyScores(response.data);
    } catch (err: any) {
      const errorMessage = err.response?.data?.detail || 'Failed to fetch my scores';
      setError(prev => ({ ...prev, myScores: errorMessage }));
      console.error('Failed to fetch my scores:', err);
    } finally {
      setLoading(prev => ({ ...prev, myScores: false }));
    }
  }, [currentUser]);

  const fetchScoresOnMe = useCallback(async () => {
    if (!currentUser) return;
    
    setLoading(prev => ({ ...prev, scoresOnMe: true }));
    setError(prev => ({ ...prev, scoresOnMe: null }));
    
    try {
      const response = await api.getScoresOnMe();
      setScoresOnMe(response.data);
    } catch (err: any) {
      const errorMessage = err.response?.data?.detail || 'Failed to fetch scores on me';
      setError(prev => ({ ...prev, scoresOnMe: errorMessage }));
      console.error('Failed to fetch scores on me:', err);
    } finally {
      setLoading(prev => ({ ...prev, scoresOnMe: false }));
    }
  }, [currentUser]);

  const fetchUsers = useCallback(async () => {
    if (!currentUser) return;
    
    setLoading(prev => ({ ...prev, users: true }));
    setError(prev => ({ ...prev, users: null }));
    
    try {
      const response = await api.searchUsers('');
      // Filter out the current user
      const filteredUsers = response.data.filter((user: User) => user.id !== currentUser.id);
      setUsers(filteredUsers);
    } catch (err: any) {
      const errorMessage = err.response?.data?.detail || 'Failed to fetch users';
      setError(prev => ({ ...prev, users: errorMessage }));
      console.error('Failed to fetch users:', err);
    } finally {
      setLoading(prev => ({ ...prev, users: false }));
    }
  }, [currentUser]);

  // Mutator functions with optimistic updates
  const updateProfile = useCallback(async (profileData: any) => {
    try {
      // Optimistic update
      if (profile) {
        setProfile(prev => prev ? { ...prev, ...profileData } : null);
      }
      
      await api.updateProfile(profileData);
      await fetchProfile(); // Refresh to get server state
      showToast('Profile updated successfully!', 'success');
    } catch (err: any) {
      // Revert optimistic update on error
      await fetchProfile();
      const errorMessage = err.response?.data?.detail || 'Failed to update profile';
      showToast(errorMessage, 'error');
      throw err;
    }
  }, [fetchProfile, showToast, profile]);

  const createProfile = useCallback(async (profileData: any) => {
    setLoading(prev => ({ ...prev, createProfile: true }));
    
    try {
      await api.createProfile(profileData);
      await fetchProfile(); // Refresh profile data
      showToast('Profile created successfully!', 'success');
    } catch (err: any) {
      const errorMessage = err.response?.data?.detail || 'Failed to create profile';
      showToast(errorMessage, 'error');
      throw err;
    } finally {
      setLoading(prev => ({ ...prev, createProfile: false }));
    }
  }, [fetchProfile, showToast]);

  const saveScore = useCallback(async (scoreData: any) => {
    try {
      await api.saveScoreResult(scoreData);
      // Refresh both score lists since a new score affects both
      await Promise.all([fetchMyScores(), fetchScoresOnMe()]);
      // Also refresh dashboard stats since they might be affected
      await fetchDashboardStats();
      showToast('Score saved successfully!', 'success');
    } catch (err: any) {
      const errorMessage = err.response?.data?.detail || 'Failed to save score';
      showToast(errorMessage, 'error');
      throw err;
    }
  }, [fetchMyScores, fetchScoresOnMe, fetchDashboardStats, showToast]);

  const updateScoreStatus = useCallback(async (scoreId: string, statusData: any) => {
    try {
      // Optimistic updates for better UX
      setMyScores(prev => prev.map(score => 
        score.id === scoreId ? { ...score, ...statusData } : score
      ));
      setScoresOnMe(prev => prev.map(score => 
        score.id === scoreId ? { ...score, ...statusData } : score
      ));
      
      await api.updateScoreStatus(scoreId, statusData);
      // Refresh both score lists since status updates affect both
      await Promise.all([fetchMyScores(), fetchScoresOnMe()]);
      // Also refresh dashboard stats since they might be affected
      await fetchDashboardStats();
      showToast('Score status updated successfully!', 'success');
    } catch (err: any) {
      // Revert optimistic updates on error
      await Promise.all([fetchMyScores(), fetchScoresOnMe()]);
      const errorMessage = err.response?.data?.detail || 'Failed to update score status';
      showToast(errorMessage, 'error');
      throw err;
    }
  }, [fetchMyScores, fetchScoresOnMe, fetchDashboardStats, showToast]);

  const deleteScore = useCallback(async (scoreId: string) => {
    try {
      // Optimistic update
      setMyScores(prev => prev.filter(score => score.id !== scoreId));
      setScoresOnMe(prev => prev.filter(score => score.id !== scoreId));
      
      await api.deleteLoanApplication(scoreId);
      // Refresh both score lists
      await Promise.all([fetchMyScores(), fetchScoresOnMe()]);
      // Also refresh dashboard stats
      await fetchDashboardStats();
      showToast('Score deleted successfully!', 'success');
    } catch (err: any) {
      // Revert optimistic update on error
      await Promise.all([fetchMyScores(), fetchScoresOnMe()]);
      const errorMessage = err.response?.data?.detail || 'Failed to delete score';
      showToast(errorMessage, 'error');
      throw err;
    }
  }, [fetchMyScores, fetchScoresOnMe, fetchDashboardStats, showToast]);

  // Utility functions
  const refreshAllData = useCallback(async () => {
    if (!currentUser) return;
    
    setLoading(prev => ({ ...prev, initial: true }));
    setError(prev => ({ ...prev, initial: null }));
    
    try {
      await Promise.all([
        fetchProfile(),
        fetchDashboardStats(),
        fetchMyScores(),
        fetchScoresOnMe(),
        fetchUsers(),
      ]);
    } catch (err) {
      const errorMessage = 'Failed to load initial data';
      setError(prev => ({ ...prev, initial: errorMessage }));
      console.error('Failed to refresh all data:', err);
    } finally {
      setLoading(prev => ({ ...prev, initial: false }));
    }
  }, [currentUser, fetchProfile, fetchDashboardStats, fetchMyScores, fetchScoresOnMe, fetchUsers]);

  const clearData = useCallback(() => {
    setProfile(null);
    setDashboardStats(null);
    setMyScores([]);
    setScoresOnMe([]);
    setUsers([]);
    setError({
      profile: null,
      dashboardStats: null,
      myScores: null,
      scoresOnMe: null,
      users: null,
      initial: null,
    });
  }, []);

  const getUserById = useCallback((id: string) => {
    return users.find(user => user.id === id);
  }, [users]);

  // Show error toasts when errors occur (but not for initial loading)
  useEffect(() => {
    Object.entries(error).forEach(([key, errorMessage]) => {
      if (errorMessage && key !== 'initial') {
        showToast(errorMessage, 'error');
      }
    });
  }, [error, showToast]);

  // Initial data fetch when user is authenticated
  useEffect(() => {
    if (currentUser) {
      refreshAllData();
    } else {
      clearData();
    }
  }, [currentUser, refreshAllData, clearData]);

  const value: DataContextType = {
    // Data
    profile,
    dashboardStats,
    myScores,
    scoresOnMe,
    users,
    
    // Loading states
    loading,
    
    // Error states
    error,
    
    // Fetch functions
    fetchProfile,
    fetchDashboardStats,
    fetchMyScores,
    fetchScoresOnMe,
    fetchUsers,
    
    // Mutator functions
    updateProfile,
    createProfile,
    saveScore,
    updateScoreStatus,
    deleteScore,
    
    // Utility functions
    refreshAllData,
    clearData,
    getUserById,
  };

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  );
};

export default DataContext; 