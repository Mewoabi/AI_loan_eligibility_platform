# Users Context Documentation

This documentation explains how to use the users context in your React application to manage and access all users in the system (excluding the logged-in user).

## Setup

The users context is already set up in your application. The `UsersProvider` wraps your entire app in `App.tsx`, so you can use the users functionality anywhere in your component tree.

## Basic Usage

### Import the hook
```typescript
import { useUsers } from '../context/usersContext';
```

### Use in your component
```typescript
const MyComponent: React.FC = () => {
  const { users, isFetched, fetchAllUsers } = useUsers();

  useEffect(() => {
    if (!isFetched) {
      fetchAllUsers();
    }
  }, [isFetched, fetchAllUsers]);

  return (
    <div>
      {users.map(user => (
        <div key={user.id}>{user.fullName}</div>
      ))}
    </div>
  );
};
```

## API Reference

### `useUsers()` Hook

Returns an object with the following properties and methods:

- `users: User[]` - Array of all users except the logged-in user
- `isFetched: boolean` - Whether users have been successfully fetched
- `isLoading: boolean` - Whether a fetch operation is currently in progress
- `error: string | null` - Error message if fetching failed
- `fetchAllUsers()` - Function to fetch all users initially
- `refreshUsers()` - Function to refresh/refetch the users list
- `clearUsers()` - Function to clear the users list and reset state

### User Interface

```typescript
interface User {
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
```

## Examples

### Basic Usage with Loading State
```typescript
const UsersList: React.FC = () => {
  const { users, isFetched, isLoading, fetchAllUsers } = useUsers();

  useEffect(() => {
    if (!isFetched && !isLoading) {
      fetchAllUsers();
    }
  }, [isFetched, isLoading, fetchAllUsers]);

  if (isLoading) {
    return <div>Loading users...</div>;
  }

  return (
    <div>
      {users.map(user => (
        <div key={user.id}>
          <h3>{user.fullName}</h3>
          <p>{user.email}</p>
          {user.profile && (
            <p>Income: ${user.profile.income}</p>
          )}
        </div>
      ))}
    </div>
  );
};
```

### User Search Component
```typescript
const UserSearch: React.FC = () => {
  const { users, isFetched, fetchAllUsers } = useUsers();
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (!isFetched) {
      fetchAllUsers();
    }
  }, [isFetched, fetchAllUsers]);

  const filteredUsers = users.filter(user =>
    user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <input
        type="text"
        placeholder="Search users..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      {filteredUsers.map(user => (
        <div key={user.id}>{user.fullName} - {user.email}</div>
      ))}
    </div>
  );
};
```

### User Selection for Scoring
```typescript
const ScoreUserComponent: React.FC = () => {
  const { users, isFetched, fetchAllUsers } = useUsers();
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  useEffect(() => {
    if (!isFetched) {
      fetchAllUsers();
    }
  }, [isFetched, fetchAllUsers]);

  const handleUserSelect = (user: User) => {
    setSelectedUser(user);
    // Pre-fill scoring form with user data
    if (user.profile) {
      // Use user profile data for scoring
    }
  };

  return (
    <div>
      <h2>Select User to Score</h2>
      {users.map(user => (
        <button
          key={user.id}
          onClick={() => handleUserSelect(user)}
          className={selectedUser?.id === user.id ? 'selected' : ''}
        >
          {user.fullName} - {user.email}
          {user.profile ? ' (Has Profile)' : ' (No Profile)'}
        </button>
      ))}
      
      {selectedUser && (
        <div>
          <h3>Selected: {selectedUser.fullName}</h3>
          {/* Show scoring form */}
        </div>
      )}
    </div>
  );
};
```

### Refresh Users
```typescript
const UserManagement: React.FC = () => {
  const { users, isLoading, refreshUsers, clearUsers } = useUsers();

  const handleRefresh = async () => {
    await refreshUsers();
  };

  const handleClear = () => {
    clearUsers();
  };

  return (
    <div>
      <button onClick={handleRefresh} disabled={isLoading}>
        {isLoading ? 'Refreshing...' : 'Refresh Users'}
      </button>
      <button onClick={handleClear}>Clear Users</button>
      
      <div>Total Users: {users.length}</div>
    </div>
  );
};
```

### Error Handling
```typescript
const UsersWithErrorHandling: React.FC = () => {
  const { users, isFetched, isLoading, error, fetchAllUsers } = useUsers();

  useEffect(() => {
    if (!isFetched && !isLoading) {
      fetchAllUsers();
    }
  }, [isFetched, isLoading, fetchAllUsers]);

  if (error) {
    return (
      <div className="error">
        <p>Error loading users: {error}</p>
        <button onClick={fetchAllUsers}>Retry</button>
      </div>
    );
  }

  if (isLoading) {
    return <div>Loading users...</div>;
  }

  return (
    <div>
      {users.length === 0 ? (
        <p>No users found</p>
      ) : (
        users.map(user => (
          <div key={user.id}>{user.fullName}</div>
        ))
      )}
    </div>
  );
};
```

## Features

- ✅ Automatically excludes the logged-in user from results
- ✅ Caching with `isFetched` state to avoid unnecessary API calls
- ✅ Loading states and error handling
- ✅ Refresh functionality to update the users list
- ✅ Clear functionality to reset the state
- ✅ TypeScript support with proper interfaces
- ✅ Integration with AuthContext for current user filtering

## Best Practices

1. **Check `isFetched` before fetching**: Always check if users are already fetched to avoid duplicate API calls
2. **Handle loading states**: Show loading indicators while fetching users
3. **Handle errors gracefully**: Provide retry mechanisms for failed requests
4. **Use refresh wisely**: Only refresh when you need the most up-to-date data
5. **Filter users as needed**: Use the users array for searching, filtering, or selection
6. **Clear when appropriate**: Use `clearUsers()` when logging out or when user data is no longer needed

## Integration with Other Components

This context is designed to work seamlessly with:
- **ScoreUser component**: For selecting users to score
- **User management components**: For displaying user lists
- **Search components**: For finding specific users
- **Admin panels**: For user oversight and management

## Demo Component

Check out `src/components/UsersDemo.tsx` for interactive examples of all users context functionality.
