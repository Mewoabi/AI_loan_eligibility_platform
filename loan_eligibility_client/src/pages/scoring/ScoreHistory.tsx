import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import type { Gender, MaritalStatus, Education, EmploymentStatus, PropertyArea, DecisionStatus, LoanOutcome } from '../../types/enums';
import { useUsers } from '../../context/usersContext';

// type ScoreHistoryItem = {
//   id: string;
//   scorerId: string;
//   scoreduserId: string | null;
//   scoredUserName: string;
//   scoredUserEmail: string;
//   score: number;
//   eligible: boolean;
//   decisionStatus: string;
//   awardedAmount: number | null;
//   outcomeStatus: string | null;
//   createdAt: string;
//   scorerName: string;
//   type: 'performed' | 'received';
// };

type ScoreHistoryItem = {
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
    // createdAt: Date;
    // updatedAt: Date;
      createdAt: string;
    updatedAt: string;
    scoreData?: Record<string, any>;
    type: 'performed' | 'received';
};

const ScoreHistory: React.FC = () => {
  const { user } = useAuth();
  const { myScores, scoresOnMe, loading, error: dataError, getUserById } = useData();
  const [allScores, setAllScores] = useState<ScoreHistoryItem[]>([]);
  const [filteredScores, setFilteredScores] = useState<ScoreHistoryItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'performed' | 'received'>('all');
  const [sortBy, setSortBy] = useState<'date' | 'score' | 'name'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [error, setError] = useState<string | null>(null);
  const { getUser } = useUsers();

  useEffect(() => {
    if (!user) return;
    
    const myScoresWithType = myScores.map((score: any) => ({
      ...score,
      type: 'performed' as const
    }));
    
    const scoresOnMeWithType = scoresOnMe.map((score: any) => ({
      ...score,
      type: 'received' as const
    }));
    
    const combined = [...myScoresWithType, ...scoresOnMeWithType];
    setAllScores(combined);
    setFilteredScores(combined);
  }, [user, myScores, scoresOnMe]);

  useEffect(() => {
    let filtered = allScores;

    // Apply type filter
    if (filterType !== 'all') {
      filtered = filtered.filter(score => score.type === filterType);
    }

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(score => {
        const scoredUser = getUserById(score.scoreduserId);
        const scorer = getUserById(score.scorerId || '');
        const searchTarget = score.type === 'performed' 
          ? `${scoredUser?.fullName} ${scoredUser?.email}`
          : scorer?.fullName || '';
        return searchTarget.toLowerCase().includes(searchTerm.toLowerCase());
      });
    }

    // Apply sorting
    filtered.sort((a, b) => {
      const aScorer = getUserById(a.scorerId || '');
      const bScorer = getUserById(b.scorerId || '');
      const aScoredUser = getUserById(a.scoreduserId);
      const bScoredUser = getUserById(b.scoreduserId);
      let aValue, bValue;
      
      switch (sortBy) {
        case 'date':
          aValue = new Date(a.createdAt).getTime();
          bValue = new Date(b.createdAt).getTime();
          break;
        case 'score':
          aValue = a.score;
          bValue = b.score;
          break;
        case 'name':
          aValue = a.type === 'performed' ? aScoredUser?.fullName : aScorer?.fullName || '';
          bValue = b.type === 'performed' ? bScoredUser?.fullName : bScorer?.fullName || '';
          aValue = aValue && aValue.toLowerCase();
          bValue = bValue && bValue.toLowerCase();
          break;
        default:
          aValue = new Date(a.createdAt).getTime();
          bValue = new Date(b.createdAt).getTime();
      }

      if (sortOrder === 'asc') {
        return (aValue && bValue) &&  (aValue > bValue) ? 1 : -1;
      } else {
        return (aValue && bValue) && (aValue < bValue) ? 1 : -1;
      }
    });

    setFilteredScores(filtered);
  }, [allScores, searchTerm, filterType, sortBy, sortOrder]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getRepaymentBadge = (status: string | null) => {
    if (!status) return null;
    
    switch (status) {
      case 'PAID':
        return <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">Paid</span>;
      case 'DEFAULTED':
        return <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-800">Defaulted</span>;
      case 'IN_PROGRESS':
        return <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">In Progress</span>;
      case 'OVERDUE':
        return <span className="px-2 py-1 text-xs rounded-full bg-orange-100 text-orange-800">Overdue</span>;
      default:
        return null;
    }
  };

  // if (isLoading) {
  //   return (
  //     <div className="flex justify-center items-center h-64">
  //       <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-sky-500"></div>
  //     </div>
  //   );
  // }

  return (
    <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div className="px-4 py-6 sm:px-0">
        <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-lg transition-colors duration-300">
          <div className="px-4 py-5 sm:px-6 bg-gradient-to-r from-sky-500 to-teal-500">
            <div className="flex justify-between items-center">
              <h3 className="text-lg leading-6 font-medium text-white">Complete Score History</h3>
              <div className="text-white text-sm">
                Total: {filteredScores.length} score{filteredScores.length !== 1 ? 's' : ''}
              </div>
            </div>
          </div>

          {error && (
            <div className="rounded-md bg-red-50 dark:bg-red-900/50 m-4 p-4 transition-colors duration-300">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400 dark:text-red-300" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">{error}</h3>
                </div>
              </div>
            </div>
          )}

          {/* Filters and Search */}
          <div className="p-6 bg-gray-50 dark:bg-gray-700 border-b dark:border-gray-600 transition-colors duration-300">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
                <input
                  type="text"
                  placeholder="Search by name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full border dark:text-gray-100 border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Type</label>
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value as 'all' | 'performed' | 'received')}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                >
                  <option value="all">All Scores</option>
                  <option value="performed">Scores I Performed</option>
                  <option value="received">Scores on Me</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Sort by</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as 'date' | 'score' | 'name')}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                >
                  <option value="date">Date</option>
                  <option value="score">Score</option>
                  <option value="name">Name</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Order</label>
                <select
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value as 'asc' | 'desc')}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                >
                  <option value="desc">Descending</option>
                  <option value="asc">Ascending</option>
                </select>
              </div>
            </div>
          </div>

          {/* Score History Table */}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-600 transition-colors duration-300">
              <thead className="bg-gray-50 dark:bg-gray-700 transition-colors duration-300">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider transition-colors duration-300">
                    Type
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider transition-colors duration-300">
                    Person
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider transition-colors duration-300">
                    Score
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider transition-colors duration-300">
                    Date
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider transition-colors duration-300">
                    Loan Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider transition-colors duration-300">
                    Repayment
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider transition-colors duration-300">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-600 transition-colors duration-300">
                {filteredScores.map((score) => (
                  <tr key={`${score.id}-${score.type}`} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-300">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs rounded-full font-medium transition-colors duration-300 ${
                        score.type === 'performed' 
                          ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-200' 
                          : 'bg-purple-100 dark:bg-purple-900/50 text-purple-800 dark:text-purple-200'
                      }`}>
                        {score.type === 'performed' ? 'I Scored' : 'Scored Me'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900 dark:text-white transition-colors duration-300">
                          {score.type === 'performed' ? getUser(score.scoreduserId)?.fullName : score.scorerId ? getUser(score.scorerId)?.fullName: 'Unknown User'}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400 transition-colors duration-300">{score.type === 'performed' ? getUser(score.scoreduserId)?.email : score.scorerId ? getUser(score.scorerId)?.email : ''}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <span className={`text-lg font-bold transition-colors duration-300 ${score.eligible ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}> 
                          {((score.score || 0) * 100).toFixed(1)}%
                        </span>
                        <span className={`ml-2 px-2 py-1 text-xs rounded-full transition-colors duration-300 ${
                          score.eligible ? 'bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-200' : 'bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-200'
                        }`}>
                          {score.eligible ? 'Eligible' : 'Not Eligible'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 transition-colors duration-300">
                      {formatDate(score.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col space-y-1">
                        {(score.decisionStatus === 'AWARDED' || score.decisionStatus === 'AWARDED_AND_TAKEN') ? (
                          <span className="px-2 py-1 text-xs rounded-full bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-200 transition-colors duration-300">
                            Awarded: XAF {score.awardedAmount?.toLocaleString()}
                          </span>
                        ) : score.decisionStatus === 'DECLINED' ? (
                          <span className="px-2 py-1 text-xs rounded-full bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-200 transition-colors duration-300">
                            Declined
                          </span>
                        ) : (
                          <span className="px-2 py-1 text-xs rounded-full bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 transition-colors duration-300">
                            Pending
                          </span>
                        )}
                        {score.decisionStatus === 'AWARDED_AND_TAKEN' && (
                          <span className="px-2 py-1 text-xs rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-200 transition-colors duration-300">
                            Loan Taken
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {score.decisionStatus === 'AWARDED_AND_TAKEN' && getRepaymentBadge(score.outcomeStatus || null)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Link
                        to={`/scores/${score.id}`}
                        className="text-sky-600 dark:text-sky-400 hover:text-sky-900 dark:hover:text-sky-300 font-medium transition-colors duration-300"
                      >
                        View Details
                      </Link>
                    </td>
                  </tr>
                ))}

                {/* Empty State */}
                {filteredScores.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-6 py-10 text-center text-sm text-gray-500 dark:text-gray-400 transition-colors duration-300">
                      <div className="flex flex-col items-center justify-center">
                        <svg className="h-10 w-10 text-gray-400 dark:text-gray-500 transition-colors duration-300" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" viewBox="0 0 24 24" stroke="currentColor">
                          <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white transition-colors duration-300">No scores found</h3>
                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 transition-colors duration-300">
                          {searchTerm || filterType !== 'all' 
                            ? 'Try adjusting your search or filters.' 
                            : 'You have no score history yet.'}
                        </p>
                        {!searchTerm && filterType === 'all' && (
                          <div className="mt-6">
                            <Link
                              to="/score-user"
                              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-gradient-to-r from-sky-500 to-teal-500 hover:from-sky-600 hover:to-teal-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 dark:ring-offset-gray-800 transition-all duration-200"
                            >
                              Score Someone
                            </Link>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Summary Stats */}
          {filteredScores.length > 0 && (
            <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700 border-t dark:border-gray-600 transition-colors duration-300">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div>
                  <div className="text-lg font-semibold text-gray-900 dark:text-white transition-colors duration-300">
                    {filteredScores.filter(s => s.type === 'performed').length}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400 transition-colors duration-300">Scores Performed</div>
                </div>
                <div>
                  <div className="text-lg font-semibold text-gray-900 dark:text-white transition-colors duration-300">
                    {filteredScores.filter(s => s.type === 'received').length}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400 transition-colors duration-300">Scores Received</div>
                </div>                <div>
                  <div className="text-lg font-semibold text-gray-900 dark:text-white transition-colors duration-300">
                    {filteredScores.filter(s => s.decisionStatus === 'AWARDED' || s.decisionStatus === 'AWARDED_AND_TAKEN').length}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400 transition-colors duration-300">Loans Awarded</div>
                </div>
                <div>
                  <div className="text-lg font-semibold text-gray-900 dark:text-white transition-colors duration-300">
                    {filteredScores.filter(s => s.outcomeStatus === 'PAID').length}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400 transition-colors duration-300">Successfully Repaid</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ScoreHistory;