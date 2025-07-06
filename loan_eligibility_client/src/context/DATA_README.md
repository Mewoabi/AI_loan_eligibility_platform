# DataContext Implementation

## Overview

The `DataContext` is a centralized state management solution for the Loan Eligibility App that handles all data fetching, caching, and synchronization between the frontend and backend. It eliminates the need for individual components to make direct API calls and ensures data consistency across the entire application.

## Features

### 🚀 **Centralized Data Management**
- Single source of truth for all application data
- Automatic data fetching on authentication
- Intelligent caching to reduce API calls

### 🔄 **Automatic Data Syncing**
- Real-time data updates after mutations
- Automatic refresh of related data when changes occur
- Optimistic updates for better UX

### 🛡️ **Error Handling & Loading States**
- Comprehensive error handling with toast notifications
- Granular loading states for each data type
- Graceful error recovery

### 📊 **Data Types Managed**
- **Profile**: User profile information
- **Dashboard Stats**: Application statistics and metrics
- **My Scores**: Credit assessments performed by the user
- **Scores On Me**: Credit assessments received by the user
- **Users**: List of users for scoring purposes

## Usage

### Basic Usage

```tsx
import { useData } from '../context/DataContext';

const MyComponent = () => {
  const { 
    profile, 
    dashboardStats, 
    myScores, 
    loading, 
    error,
    updateProfile 
  } = useData();

  // Use the data directly
  if (loading.profile) return <div>Loading profile...</div>;
  
  return (
    <div>
      <h1>Welcome, {profile?.fullName}</h1>
      <p>Total scores: {dashboardStats?.totalScoresPerformed}</p>
    </div>
  );
};
```

### Data Access

```tsx
const { 
  // Data
  profile,           // Profile | null
  dashboardStats,    // DashboardStats | null
  myScores,          // Score[]
  scoresOnMe,        // Score[]
  users,             // User[]
  
  // Loading states
  loading,           // LoadingState
  
  // Error states
  error,             // ErrorState
} = useData();
```

### Mutations (Write Operations)

```tsx
const { 
  updateProfile,      // Update user profile
  createProfile,      // Create new profile
  saveScore,          // Save new credit assessment
  updateScoreStatus,  // Update assessment status
  deleteScore,        // Delete assessment
} = useData();

// Example: Update profile
const handleUpdateProfile = async () => {
  try {
    await updateProfile({
      fullName: 'John Doe',
      income: 50000,
      // ... other fields
    });
    // Data is automatically refreshed after successful update
  } catch (error) {
    // Error is automatically handled and displayed as toast
  }
};
```

### Utility Functions

```tsx
const { 
  refreshAllData,    // Refresh all data
  clearData,         // Clear all data (on logout)
  getUserById,       // Get user by ID
} = useData();

// Example: Manual refresh
const handleRefresh = async () => {
  await refreshAllData();
};
```

## Data Types

### Profile
```tsx
interface Profile {
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
```

### DashboardStats
```tsx
interface DashboardStats {
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
```

### Score
```tsx
interface Score {
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
```

## Integration with App

### Provider Setup

The `DataProvider` is integrated into the app hierarchy in `App.tsx`:

```tsx
function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ToastProvider>
          <DataProvider>        {/* ← DataContext Provider */}
            <UsersProvider>
              <Router>
                {/* App Routes */}
              </Router>
            </UsersProvider>
          </DataProvider>
        </ToastProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
```

### Context Dependencies

The DataContext depends on:
- **AuthContext**: For user authentication state
- **ToastContext**: For error and success notifications

## Migration Guide

### Before (Direct API Calls)
```tsx
// Old way - direct API calls
const [profile, setProfile] = useState(null);
const [loading, setLoading] = useState(true);

useEffect(() => {
  const fetchProfile = async () => {
    try {
      const response = await api.getProfile();
      setProfile(response.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };
  fetchProfile();
}, []);

const handleUpdate = async (data) => {
  try {
    await api.updateProfile(data);
    // Manually refresh data
    const response = await api.getProfile();
    setProfile(response.data);
  } catch (error) {
    console.error(error);
  }
};
```

### After (DataContext)
```tsx
// New way - using DataContext
const { profile, loading, updateProfile } = useData();

// Data is automatically loaded
// No need for useEffect or manual state management

const handleUpdate = async (data) => {
  try {
    await updateProfile(data);
    // Data is automatically refreshed
  } catch (error) {
    // Error is automatically handled
  }
};
```

## Benefits

### 🎯 **Developer Experience**
- Reduced boilerplate code
- Automatic error handling
- Consistent data patterns

### 🚀 **Performance**
- Reduced API calls through caching
- Optimistic updates
- Efficient re-renders

### 🔒 **Reliability**
- Centralized error handling
- Automatic retry mechanisms
- Data consistency guarantees

### 🎨 **User Experience**
- Instant feedback on actions
- Consistent loading states
- Automatic data synchronization

## Best Practices

### ✅ **Do's**
- Use the DataContext for all data operations
- Leverage loading states for better UX
- Handle errors gracefully (they're automatically displayed)
- Use the utility functions for common operations

### ❌ **Don'ts**
- Don't make direct API calls in components
- Don't manage data state locally when it's available in context
- Don't ignore loading states
- Don't duplicate data fetching logic

## Testing

A test component `DataContextTest` is available to verify the DataContext functionality:

```tsx
import DataContextTest from '../components/DataContextTest';

// Add to any page to test
<DataContextTest />
```

This component displays all current data, loading states, and error states, and provides a refresh button for testing. 