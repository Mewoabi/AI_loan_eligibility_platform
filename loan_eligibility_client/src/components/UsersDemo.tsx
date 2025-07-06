import React, { useEffect } from 'react';
import { useUsers } from '../context/usersContext';

/**
 * Demo component showing how to use the users context
 * This file demonstrates various ways to use the users functionality
 */
const UsersDemo: React.FC = () => {
  const { 
    users, 
    isFetched, 
    isLoading, 
    error, 
    fetchAllUsers, 
    refreshUsers, 
    clearUsers 
  } = useUsers();

  // Fetch users when component mounts
  useEffect(() => {
    if (!isFetched && !isLoading) {
      fetchAllUsers();
    }
  }, [isFetched, isLoading, fetchAllUsers]);

  const handleRefresh = async () => {
    await refreshUsers();
  };

  const handleClear = () => {
    clearUsers();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 to-blue-100 dark:from-gray-900 dark:to-gray-800 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Users Context Demo
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Demonstration of the users context functionality
          </p>
        </div>

        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-3xl shadow-2xl p-8">
          {/* Controls */}
          <div className="flex gap-4 mb-6">
            <button
              onClick={handleRefresh}
              disabled={isLoading}
              className="px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white rounded-lg font-medium transition-colors duration-200"
            >
              {isLoading ? 'Loading...' : 'Refresh Users'}
            </button>

            <button
              onClick={handleClear}
              className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-colors duration-200"
            >
              Clear Users
            </button>
          </div>

          {/* Status Information */}
          <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Status:</h3>
            <div className="space-y-1 text-sm text-gray-600 dark:text-gray-300">
              <p>Is Fetched: <span className={isFetched ? 'text-green-600' : 'text-red-600'}>{isFetched ? 'Yes' : 'No'}</span></p>
              <p>Is Loading: <span className={isLoading ? 'text-yellow-600' : 'text-gray-600'}>{isLoading ? 'Yes' : 'No'}</span></p>
              <p>Total Users: <span className="text-blue-600">{users.length}</span></p>
              {error && <p className="text-red-600">Error: {error}</p>}
            </div>
          </div>

          {/* Users List */}
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
              Users ({users.length}):
            </h3>
            
            {isLoading && (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                <span className="ml-2 text-gray-600 dark:text-gray-300">Loading users...</span>
              </div>
            )}

            {error && (
              <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg p-4">
                <p className="text-red-800 dark:text-red-200">Error: {error}</p>
              </div>
            )}

            {!isLoading && users.length === 0 && !error && (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                {isFetched ? 'No users found' : 'Click "Refresh Users" to load users'}
              </div>
            )}

            {users.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {users.map((user) => (
                  <div
                    key={user.id}
                    className="bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg p-4 hover:shadow-lg transition-shadow duration-200"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-white">
                          {user.fullName || 'No name provided'}
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                          {user.email}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          ID: {user.id}
                        </p>
                      </div>
                      <div className="flex items-center">
                        {user.profile ? (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                            Has Profile
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                            No Profile
                          </span>
                        )}
                      </div>
                    </div>

                    {user.profile && (
                      <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-600">
                        <div className="grid grid-cols-2 gap-2 text-xs text-gray-600 dark:text-gray-300">
                          <div>Gender: {user.profile.gender}</div>
                          <div>Education: {user.profile.education}</div>
                          <div>Employment: {user.profile.employmentStatus}</div>
                          <div>Income: ${user.profile.income}</div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Usage Examples */}
          <div className="mt-8 p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
              Usage Examples:
            </h3>
            <div className="space-y-2 text-sm text-gray-600 dark:text-gray-300 font-mono">
              <p>const {'{ users, isFetched, fetchAllUsers }'} = useUsers();</p>
              <p>await fetchAllUsers(); // Fetch all users except current user</p>
              <p>await refreshUsers(); // Refresh the users list</p>
              <p>clearUsers(); // Clear the users list</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UsersDemo;
