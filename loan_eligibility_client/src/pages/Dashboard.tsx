import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const { dashboardStats, loading, error } = useData();
  
  const isLoading = loading.dashboardStats;
  const errorMessage = error.dashboardStats;

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-sky-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div className="px-4 py-6 sm:px-0">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 mb-6 transition-colors duration-300">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white transition-colors duration-300">
                Welcome back, {user?.email?.split('@')[0]}!
              </h1>
              <p className="text-gray-600 dark:text-gray-300 mt-1 transition-colors duration-300">
                Here's your ScoreSure dashboard overview
              </p>
            </div>
            <Link
              to="/score-user"
              className="bg-gradient-to-r from-sky-500 to-teal-500 text-white px-6 py-3 rounded-lg font-medium hover:from-sky-600 hover:to-teal-600 transition-all duration-200"
            >
              Score Someone
            </Link>
          </div>
        </div>

        {errorMessage && (
          <div className="bg-red-50 dark:bg-red-900/50 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6 transition-colors duration-300">
            <p className="text-red-700 dark:text-red-200 transition-colors duration-300">{errorMessage}</p>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 transition-colors duration-300">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-gradient-to-r from-sky-500 to-teal-500 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400 transition-colors duration-300">Scores Performed</p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-white transition-colors duration-300">{dashboardStats?.totalScoresPerformed || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 transition-colors duration-300">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400 transition-colors duration-300">Scores Received</p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-white transition-colors duration-300">{dashboardStats?.totalScoresReceived || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 transition-colors duration-300">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400 transition-colors duration-300">Loans Tracked</p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-white transition-colors duration-300">{dashboardStats?.totalLoansTracked || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 transition-colors duration-300">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400 transition-colors duration-300">Successful Repayments</p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-white transition-colors duration-300">{dashboardStats?.successfulRepayments || 0}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 transition-colors duration-300">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 transition-colors duration-300">Quick Actions</h3>
            <div className="space-y-3">
              <Link
                to="/score-user"
                className="flex items-center p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-300"
              >
                <div className="w-10 h-10 bg-sky-100 dark:bg-sky-900/50 rounded-lg flex items-center justify-center mr-4 transition-colors duration-300">
                  <svg className="w-5 h-5 text-sky-600 dark:text-sky-400 transition-colors duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </div>
                <div>
                  <p className="font-medium text-gray-900 dark:text-white transition-colors duration-300">Perform Credit Score</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 transition-colors duration-300">Score someone's creditworthiness</p>
                </div>
              </Link>
              
              <Link
                to="/my-scores"
                className="flex items-center p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-300"
              >
                <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/50 rounded-lg flex items-center justify-center mr-4 transition-colors duration-300">
                  <svg className="w-5 h-5 text-purple-600 dark:text-purple-400 transition-colors duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <div>
                  <p className="font-medium text-gray-900 dark:text-white transition-colors duration-300">View My Scores</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 transition-colors duration-300">See scores I've performed</p>
                </div>
              </Link>
              
              <Link
                to="/profile"
                className="flex items-center p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-300"
              >
                <div className="w-10 h-10 bg-green-100 dark:bg-green-900/50 rounded-lg flex items-center justify-center mr-4 transition-colors duration-300">
                  <svg className="w-5 h-5 text-green-600 dark:text-green-400 transition-colors duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <div>
                  <p className="font-medium text-gray-900 dark:text-white transition-colors duration-300">Edit Profile</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 transition-colors duration-300">Update your information</p>
                </div>
              </Link>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 transition-colors duration-300">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 transition-colors duration-300">Recent Activity</h3>
            {dashboardStats?.recentScores && dashboardStats.recentScores.length > 0 ? (
              <div className="space-y-3">
                {dashboardStats.recentScores.map((score: any) => (
                  <div key={score.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg transition-colors duration-300">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white transition-colors duration-300">{score.scoredUserName}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400 transition-colors duration-300">
                        Score: {(score.score * 100).toFixed(1)}% • {new Date(score.date).toLocaleDateString()}
                      </p>                    </div>
                    {score.decisionStatus === 'AWARDED_AND_TAKEN' && (
                      <span className="px-2 py-1 text-xs font-medium bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-200 rounded-full transition-colors duration-300">
                        Loan Taken
                      </span>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 dark:text-gray-400 text-center py-8 transition-colors duration-300">No recent activity</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;