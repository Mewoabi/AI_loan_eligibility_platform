import React from 'react';
import { useData } from '../context/DataContext';

const DataContextTest: React.FC = () => {
  const { 
    profile, 
    dashboardStats, 
    myScores, 
    scoresOnMe, 
    users, 
    loading, 
    error,
    refreshAllData 
  } = useData();

  return (
    <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow">
      <h2 className="text-xl font-bold mb-4">DataContext Test</h2>
      
      <div className="space-y-4">
        <div>
          <h3 className="font-semibold">Loading States:</h3>
          <pre className="text-sm bg-gray-100 dark:bg-gray-700 p-2 rounded">
            {JSON.stringify(loading, null, 2)}
          </pre>
        </div>

        <div>
          <h3 className="font-semibold">Error States:</h3>
          <pre className="text-sm bg-gray-100 dark:bg-gray-700 p-2 rounded">
            {JSON.stringify(error, null, 2)}
          </pre>
        </div>

        <div>
          <h3 className="font-semibold">Profile:</h3>
          <pre className="text-sm bg-gray-100 dark:bg-gray-700 p-2 rounded">
            {profile ? JSON.stringify(profile, null, 2) : 'No profile loaded'}
          </pre>
        </div>

        <div>
          <h3 className="font-semibold">Dashboard Stats:</h3>
          <pre className="text-sm bg-gray-100 dark:bg-gray-700 p-2 rounded">
            {dashboardStats ? JSON.stringify(dashboardStats, null, 2) : 'No dashboard stats loaded'}
          </pre>
        </div>

        <div>
          <h3 className="font-semibold">My Scores Count: {myScores.length}</h3>
        </div>

        <div>
          <h3 className="font-semibold">Scores On Me Count: {scoresOnMe.length}</h3>
        </div>

        <div>
          <h3 className="font-semibold">Users Count: {users.length}</h3>
        </div>

        <button 
          onClick={refreshAllData}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Refresh All Data
        </button>
      </div>
    </div>
  );
};

export default DataContextTest; 