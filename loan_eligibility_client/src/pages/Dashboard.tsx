import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { AppLayout } from '../layouts/AppLayout';
import { StatCard, Card, CardContent, CardTitle, Badge, Spinner } from '../components/ui';

const quickActions = [
  {
    to: '/score-user',
    title: 'Perform Credit Score',
    desc: "Score someone's creditworthiness",
    iconBg: 'bg-sky-100 dark:bg-sky-900/40',
    iconText: 'text-sky-600 dark:text-sky-400',
  },
  {
    to: '/my-scores',
    title: 'View My Scores',
    desc: "See scores I've performed",
    iconBg: 'bg-violet-100 dark:bg-violet-900/40',
    iconText: 'text-violet-600 dark:text-violet-400',
  },
  {
    to: '/profile',
    title: 'Edit Profile',
    desc: 'Update your information',
    iconBg: 'bg-emerald-100 dark:bg-emerald-900/40',
    iconText: 'text-emerald-600 dark:text-emerald-400',
  },
];

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const { dashboardStats, loading, error } = useData();

  if (loading.dashboardStats) {
    return (
      <AppLayout>
        <div className="flex justify-center py-24">
          <Spinner size="lg" label="Loading dashboard..." />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout
      title={`Welcome back, ${user?.email?.split('@')[0]}!`}
      description="Here's your ScoreSure dashboard overview"
      actions={
        <Link to="/score-user" className="btn-primary">
          Score Someone
        </Link>
      }
    >
      {error.dashboardStats && (
        <div className="rounded-xl border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 p-4 mb-6 text-red-700 dark:text-red-200">
          {error.dashboardStats}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          label="Scores Performed"
          value={dashboardStats?.totalScoresPerformed || 0}
          icon={<span className="text-lg">📊</span>}
        />
        <StatCard
          label="Scores Received"
          value={dashboardStats?.totalScoresReceived || 0}
          icon={<span className="text-lg">👤</span>}
        />
        <StatCard
          label="Loans Tracked"
          value={dashboardStats?.totalLoansTracked || 0}
          icon={<span className="text-lg">💰</span>}
        />
        <StatCard
          label="Successful Repayments"
          value={dashboardStats?.successfulRepayments || 0}
          icon={<span className="text-lg">✓</span>}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardContent>
            <CardTitle className="mb-4">Quick Actions</CardTitle>
            <div className="space-y-2">
              {quickActions.map((action) => (
                <Link
                  key={action.to}
                  to={action.to}
                  className="flex items-center p-4 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/50 border border-transparent hover:border-gray-200 dark:hover:border-gray-700 transition-all"
                >
                  <div className={`w-10 h-10 rounded-xl ${action.iconBg} flex items-center justify-center mr-4 ${action.iconText} font-bold`}>
                    →
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{action.title}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{action.desc}</p>
                  </div>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <CardTitle className="mb-4">Recent Activity</CardTitle>
            {dashboardStats?.recentScores && dashboardStats.recentScores.length > 0 ? (
              <div className="space-y-3">
                {dashboardStats.recentScores.map(
                  (score: {
                    id: string;
                    scoredUserName: string;
                    score: number;
                    date: string;
                    decisionStatus?: string;
                  }) => (
                    <div
                      key={score.id}
                      className="flex items-center justify-between p-4 rounded-xl bg-gray-50/80 dark:bg-gray-800/50"
                    >
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {score.scoredUserName}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Score: {(score.score * 100).toFixed(1)}% •{' '}
                          {new Date(score.date).toLocaleDateString()}
                        </p>
                      </div>
                      {score.decisionStatus === 'AWARDED_AND_TAKEN' && (
                        <Badge variant="info">Loan Taken</Badge>
                      )}
                    </div>
                  )
                )}
              </div>
            ) : (
              <p className="text-gray-500 dark:text-gray-400 text-center py-8">No recent activity</p>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default Dashboard;
