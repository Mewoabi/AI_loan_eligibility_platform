import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { useToast } from '../../context/toastContext';


const MyScores: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { myScores, scoresOnMe, loading, error, updateScoreStatus, getUserById } = useData();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState<'performed' | 'received'>('performed');
  const [showLoanModal, setShowLoanModal] = useState<string | null>(null);
  const [showRepaymentModal, setShowRepaymentModal] = useState<string | null>(null);

  const [loanData, setLoanData] = useState({
    actualAmount: 0,
    startDate: '',
    agreedDueDate: ''
  });

  const [repaymentData, setRepaymentData] = useState({
    status: '',
    completedDate: '',
    notes: ''
  });
  const [loanTaken, setLoanTaken] = useState<'yes' | 'no' | null>(null);

  const [loanModalLoading, setLoanModalLoading] = useState(false);
  const [repaymentModalLoading, setRepaymentModalLoading] = useState(false);

  const isLoading = loading.myScores || loading.scoresOnMe;
  const errorMessage = error.myScores || error.scoresOnMe;

  useEffect(() => {
    console.log("Scores on me:", scoresOnMe);
    console.log("My scores:", myScores);
    console.log("all scores: ",
      [...scoresOnMe, ...myScores].map(score => ({
        ...score,
        scoreduserId: getUserById(score.scoreduserId)?.fullName || 'Unknown User',
        scorerId: score.scorerId ? getUserById(score.scorerId)?.fullName || 'Unknown Scorer' : 'N/A'
      }))
    )
  }, [scoresOnMe, myScores, getUserById])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };



  const getStatusBadge = (status: string | null) => {
    if (!status) return <span className="px-2 py-1 text-xs rounded-full bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 transition-colors duration-300">Pending</span>;

    switch (status) {
      case 'PAID':
        return <span className="px-2 py-1 text-xs rounded-full bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-200 transition-colors duration-300">Paid</span>;
      case 'DEFAULTED':
        return <span className="px-2 py-1 text-xs rounded-full bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-200 transition-colors duration-300">Defaulted</span>;
      case 'IN_PROGRESS':
        return <span className="px-2 py-1 text-xs rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-200 transition-colors duration-300">In Progress</span>;
      case 'OVERDUE':
        return <span className="px-2 py-1 text-xs rounded-full bg-orange-100 dark:bg-orange-900/50 text-orange-800 dark:text-orange-200 transition-colors duration-300">Overdue</span>;
      default:
        return <span className="px-2 py-1 text-xs rounded-full bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 transition-colors duration-300">Unknown</span>;
    }
  };
  
  const handleRecordLoanTaken = async (scoreId: string) => {
    if (!loanTaken) return;
    setLoanModalLoading(true);
    try {
      // Determine the new decision status based on whether loan was taken or not
      const decisionStatus = loanTaken === 'yes' ? 'AWARDED_AND_TAKEN' : 'DECLINED';
      const outcomeStatus = loanTaken === 'yes' ? 'IN_PROGRESS' : null;

      const statusUpdate = {
        decisionStatus,
        ...(outcomeStatus && { outcomeStatus }),
        ...(loanTaken === 'yes' && {
          awardedAmount: loanData.actualAmount,
          dueDate: loanData.agreedDueDate
        })
      };

      await updateScoreStatus(scoreId, statusUpdate);
      setShowLoanModal(null);
      setLoanTaken(null);
      setLoanData({
        actualAmount: 0,
        startDate: '',
        agreedDueDate: ''
      });
    } catch (error: any) {
      showToast(error.response?.data?.detail || 'Failed to record loan', 'error');
      console.error('Failed to record loan:', error);
    } finally {
      setLoanModalLoading(false);
    }
  };
  
  const handleUpdateRepaymentStatus = async (scoreId: string) => {
    setRepaymentModalLoading(true);
    try {
      const statusUpdate = {
        outcomeStatus: repaymentData.status,
        notes: repaymentData.notes
      };
      await updateScoreStatus(scoreId, statusUpdate);
      setShowRepaymentModal(null);
      setRepaymentData({
        status: '',
        completedDate: '',
        notes: ''
      });
    } catch (error: any) {
      showToast(error.response?.data?.detail || 'Failed to update repayment status', 'error');
      console.error('Failed to update repayment status:', error);
    } finally {
      setRepaymentModalLoading(false);
    }
  };

  const handleOpenLoanModal = (scoreId: string) => {
    const selectedScore = [...scoresOnMe, ...myScores].find(({ id }) => id === scoreId);
    if (selectedScore) {
      const hasExistingLoan = selectedScore.decisionStatus === 'AWARDED_AND_TAKEN';
      setLoanTaken(hasExistingLoan ? 'yes' : null);
      setLoanData({
        actualAmount: selectedScore.awardedAmount || 0,
        startDate: selectedScore.dueDate ? new Date(selectedScore.dueDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        agreedDueDate: selectedScore.dueDate ? new Date(selectedScore.dueDate).toISOString().split('T')[0] : ''
      });
    }
    setShowLoanModal(scoreId);
  };

  const handleOpenRepaymentModal = (scoreId: string) => {
    const selectedScore = [...scoresOnMe, ...myScores].find(({ id }) => id === scoreId);
    if (selectedScore) {
      setRepaymentData({
        status: selectedScore.outcomeStatus || '',
        completedDate: selectedScore.dueDate ? new Date(selectedScore.dueDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        notes: selectedScore.notes || ''
      });
    }
    setShowRepaymentModal(scoreId);
  };

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
        <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-lg transition-colors duration-300">
          <div className="px-4 py-5 sm:px-6 bg-gradient-to-r from-sky-500 to-teal-500">
            <div className="flex justify-between items-center">
              <h3 className="text-lg leading-6 font-medium text-white">My Credit Scores</h3>
              <Link
                to="/score-user"
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-sky-600 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 transition-colors duration-200"
              >
                Score Someone
              </Link>
            </div>
          </div>

          {errorMessage && (
            <div className="rounded-md bg-red-50 dark:bg-red-900/50 m-4 p-4 transition-colors duration-300">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400 dark:text-red-300" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800 dark:text-red-200 transition-colors duration-300">{errorMessage}</h3>
                </div>
              </div>
            </div>
          )}

          {/* Tabs */}
          <div className="border-b border-gray-200 dark:border-gray-600 transition-colors duration-300">
            <nav className="-mb-px flex" aria-label="Tabs">
              <button
                onClick={() => setActiveTab('performed')}
                className={`${activeTab === 'performed'
                  ? 'border-sky-500 text-sky-600 dark:text-sky-400'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-500'
                  } w-1/2 py-4 px-1 text-center border-b-2 font-medium text-sm transition-colors duration-300`}
              >
                Scores I Performed ({myScores.length})
              </button>
              <button
                onClick={() => setActiveTab('received')}
                className={`${activeTab === 'received'
                  ? 'border-sky-500 text-sky-600 dark:text-sky-400'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-500'
                  } w-1/2 py-4 px-1 text-center border-b-2 font-medium text-sm transition-colors duration-300`}
              >
                Scores on Me ({scoresOnMe.length})
              </button>
            </nav>
          </div>

          {/* Scores Table */}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-600">
              <thead className="bg-gray-50 dark:bg-gray-700 transition-colors duration-300">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider transition-colors duration-300">
                    {activeTab === 'performed' ? 'Scored User' : 'Scorer'}
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
                    Due Date
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider transition-colors duration-300">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-600 transition-colors duration-300">
                {(activeTab === 'performed' ? myScores : scoresOnMe).map((score) => (
                  <tr key={score.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-300">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900 dark:text-white transition-colors duration-300">
                          {activeTab === 'performed' ? score.scoreduserId && getUserById(score.scoreduserId)?.fullName || 'Unknown User' : score.scorerId && getUserById(score.scorerId)?.fullName || 'Unknown User'}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400 transition-colors duration-300">
                          {activeTab === 'performed' ? score.scoreduserId && getUserById(score.scoreduserId)?.email : ''}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <span className={`text-sm font-medium ${score.eligible ? 'text-green-700 dark:text-green-400' : 'text-red-700 dark:text-red-400'} transition-colors duration-300`}>
                          {((score.score || 0) * 100).toFixed(1)}%
                        </span>
                        <span className={`ml-2 px-2 py-1 text-xs rounded-full ${score.eligible ? 'bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-200' : 'bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-200'} transition-colors duration-300`}>
                          {score.eligible ? 'Eligible' : 'Not Eligible'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 transition-colors duration-300">
                      {score.createdAt && formatDate(score.createdAt)}
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
                      {score.decisionStatus && getStatusBadge(score.outcomeStatus || null)}
                    </td>
                       <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 transition-colors duration-300">
                      {(score.decisionStatus === 'AWARDED' || score.decisionStatus === 'AWARDED_AND_TAKEN') && score.dueDate && formatDate(score.dueDate)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                      {/* Actions for scores on me */}
                      {activeTab === 'received' && score.decisionStatus === 'AWARDED' && (
                        <button
                          onClick={() => handleOpenLoanModal(score.id)}
                          className="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300 text-xs px-2 py-1 border border-blue-300 dark:border-blue-600 rounded transition-colors duration-300"
                        >
                          Record Loan
                        </button>
                      )}

                      {/* Actions for repayment status */}
                      {score.decisionStatus === 'AWARDED_AND_TAKEN' && score.scorerId === user?.id && (
                        <button
                          onClick={() => handleOpenRepaymentModal(score.id)}
                          className="text-green-600 dark:text-green-400 hover:text-green-900 dark:hover:text-green-300 text-xs px-2 py-1 border border-green-300 dark:border-green-600 rounded transition-colors duration-300"
                        >
                          Update Status
                        </button>
                      )}

                      <button
                        onClick={() => navigate(`/scores/${score.id}`)}
                        className="text-sky-600 dark:text-sky-400 hover:text-sky-900 dark:hover:text-sky-300 text-xs px-2 py-1 border border-sky-300 dark:border-sky-600 rounded transition-colors duration-300"
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}

                {/* Empty State */}
                {((activeTab === 'performed' && myScores.length === 0) ||
                  (activeTab === 'received' && scoresOnMe.length === 0)) && (
                    <tr>
                      <td colSpan={6} className="px-6 py-10 text-center text-sm text-gray-500 dark:text-gray-400 transition-colors duration-300">
                        <div className="flex flex-col items-center justify-center">
                          <svg className="h-10 w-10 text-gray-400 dark:text-gray-500 transition-colors duration-300" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" viewBox="0 0 24 24" stroke="currentColor">
                            <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white transition-colors duration-300">No scores found</h3>
                          {activeTab === 'performed' ? (
                            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 transition-colors duration-300">Get started by scoring someone's creditworthiness.</p>
                          ) : (
                            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 transition-colors duration-300">No one has scored you yet.</p>
                          )}
                          {activeTab === 'performed' && (
                            <div className="mt-6">
                              <Link
                                to="/score-user"
                                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-gradient-to-r from-sky-500 to-teal-500 hover:from-sky-600 hover:to-teal-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 dark:ring-offset-gray-800 transition-all duration-200"
                              >
                                <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                  <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                                </svg>
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
        </div>
      </div>

      {/* Loan Recording Modal */}
      {showLoanModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black/40" />
          <div className="relative z-10 p-5 border w-96 shadow-lg rounded-md bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 transition-colors duration-300">Record Loan Taken</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-300">Did you take this loan?</label>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="loanTaken"
                      value="yes"
                      checked={loanTaken === 'yes'}
                      onChange={() => {
                        setLoanTaken('yes');
                        setLoanData(prev => ({ ...prev, actualAmount: prev.actualAmount || 0 }));
                      }}
                      className="mr-2 text-sky-600 focus:ring-sky-500 dark:bg-gray-700 dark:border-gray-600"
                    />
                    <span className="text-gray-900 dark:text-white transition-colors duration-300">Yes, I took the loan</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="loanTaken"
                      value="no"
                      checked={loanTaken === 'no'}
                      onChange={() => {
                        setLoanTaken('no');
                        setLoanData(prev => ({ ...prev, actualAmount: -1 }));
                      }}
                      className="mr-2 text-sky-600 focus:ring-sky-500 dark:bg-gray-700 dark:border-gray-600"
                    />
                    <span className="text-gray-900 dark:text-white transition-colors duration-300">No, I declined the loan</span>
                  </label>
                </div>
              </div>

              {loanTaken === 'yes' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-300">Actual Loan Amount (XAF)</label>
                    <input
                      type="number"
                      value={loanData.actualAmount}
                      onChange={(e) => setLoanData(prev => ({ ...prev, actualAmount: parseFloat(e.target.value) || 0 }))}
                      className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-colors duration-300"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-300">Start Date</label>
                    <input
                      type="date"
                      value={loanData.startDate}
                      onChange={(e) => setLoanData(prev => ({ ...prev, startDate: e.target.value }))}
                      className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-colors duration-300"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-300">Agreed Due Date</label>
                    <input
                      type="date"
                      value={loanData.agreedDueDate}
                      onChange={(e) => setLoanData(prev => ({ ...prev, agreedDueDate: e.target.value }))}
                      className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-colors duration-300"
                    />
                  </div>
                </>
              )}
            </div>
            <div className="flex space-x-4 mt-6">
              <button
                onClick={() => handleRecordLoanTaken(showLoanModal)}
                className="bg-gradient-to-r from-sky-500 to-teal-500 text-white px-4 py-2 rounded-lg font-medium hover:from-sky-600 hover:to-teal-600 transition-all duration-200 disabled:opacity-60 flex items-center justify-center"
                disabled={loanModalLoading}
              >
                {loanModalLoading ? (<span className="flex items-center"><svg className="animate-spin h-5 w-5 mr-2 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path></svg>Saving...</span>) : 'Save'}
              </button>
              <button
                onClick={() => {
                  setShowLoanModal(null);
                  setLoanTaken(null);
                  setLoanData({ actualAmount: 0, startDate: '', agreedDueDate: '' });
                }}
                className="border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors duration-300"
                disabled={loanModalLoading}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Repayment Status Modal */}
      {showRepaymentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black/40" />
          <div className="relative z-10 p-5 border w-96 shadow-lg rounded-md bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 transition-colors duration-300">Update Repayment Status</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-300">Repayment Status</label>
                <select
                  value={repaymentData.status}
                  onChange={(e) => setRepaymentData(prev => ({ ...prev, status: e.target.value }))}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-colors duration-300"
                >
                  <option value="">Select Status</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="PAID">Paid</option>
                  <option value="DEFAULTED">Defaulted</option>
                  <option value="OVERDUE">Overdue</option>
                </select>
              </div>

              {(repaymentData.status === 'PAID' || repaymentData.status === 'DEFAULTED') && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-300">Completion Date</label>
                  <input
                    type="date"
                    value={repaymentData.completedDate}
                    onChange={(e) => setRepaymentData(prev => ({ ...prev, completedDate: e.target.value }))}
                    className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-colors duration-300"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-300">Notes</label>
                <textarea
                  value={repaymentData.notes}
                  onChange={(e) => setRepaymentData(prev => ({ ...prev, notes: e.target.value }))}
                  rows={3}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-colors duration-300"
                  placeholder="Optional notes..."
                />
              </div>
            </div>
            <div className="flex space-x-4 mt-6">
              <button
                onClick={() => handleUpdateRepaymentStatus(showRepaymentModal)}
                className="bg-gradient-to-r from-sky-500 to-teal-500 text-white px-4 py-2 rounded-lg font-medium hover:from-sky-600 hover:to-teal-600 transition-all duration-200 disabled:opacity-60 flex items-center justify-center"
                disabled={repaymentModalLoading}
              >
                {repaymentModalLoading ? (<span className="flex items-center"><svg className="animate-spin h-5 w-5 mr-2 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path></svg>Updating...</span>) : 'Update'}
              </button>
              <button
                onClick={() => {
                  setShowRepaymentModal(null);
                  setRepaymentData({ status: '', completedDate: '', notes: '' });
                }}
                className="border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors duration-300"
                disabled={repaymentModalLoading}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyScores;