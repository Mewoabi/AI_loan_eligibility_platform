import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import type { ReactNode } from 'react';
import { searchUsers } from '../services/api';
import { useAuth } from './AuthContext';
import { useToast } from './toastContext';

// User interface based on the ScoreUser.tsx component
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

interface UsersContextType {
  users: User[];
  isFetched: boolean;
  isLoading: boolean;
  error: string | null;
  fetchAllUsers: () => Promise<void>;
  refreshUsers: () => Promise<void>;
  clearUsers: () => void;
  getUser: (id: string) => User | undefined;
}

const UsersContext = createContext<UsersContextType | undefined>(undefined);

// Custom hook to use the users context
export const useUsers = (): UsersContextType => {
  const context = useContext(UsersContext);
  if (!context) {
    throw new Error('useUsers must be used within a UsersProvider');
  }
  return context;
};

// Users provider component
export const UsersProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [isFetched, setIsFetched] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user: currentUser } = useAuth();
  const {showToast} = useToast()

  const fetchAllUsers = useCallback(async () => {
    if (!currentUser) {
      setError('User not authenticated');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Fetch all users by passing empty query string
      const response = await searchUsers('');
      console.log('Fetched users:', response.data);
      
      // Filter out the current logged-in user
      const filteredUsers = response.data.filter((user: User) => user.id !== currentUser.id);
      
      setUsers(filteredUsers);
      setIsFetched(true);
    } catch (err: any) {
      console.error('Failed to fetch users:', err);
      setError(err.response?.data?.detail || 'Failed to fetch users');
      setIsFetched(false);
    } finally {
      setIsLoading(false);
    }
  }, [currentUser]);

  useEffect(() => {
    if (error) {
      showToast(error, 'error');
    }
  }, [error]);

  const refreshUsers = useCallback(async () => {
    await fetchAllUsers();
  }, [fetchAllUsers]);

  const clearUsers = useCallback(() => {
    setUsers([]);
    setIsFetched(false);
    setError(null);
  }, []);

  const getUser = (id: string) => {
    return users.find(user => user.id === id);
  }

  useEffect(() => {
    // Automatically fetch users when the provider mounts
    if (currentUser) {
      fetchAllUsers();
    }
  }, [currentUser]);

  const value: UsersContextType = {
    users,
    isFetched,
    isLoading,
    error,
    fetchAllUsers,
    refreshUsers,
    clearUsers, 
    getUser
  };

  return (
    <UsersContext.Provider value={value}>
      {children}
    </UsersContext.Provider>
  );
};

export default UsersContext;