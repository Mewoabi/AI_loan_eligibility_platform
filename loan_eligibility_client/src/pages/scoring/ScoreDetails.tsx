import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getScoreById } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { useToast } from '../../context/toastContext';
import type { Gender, MaritalStatus, Education, EmploymentStatus, PropertyArea, DecisionStatus, LoanOutcome } from '../../types/enums';

// interface ScoreDetail {
//   id: string;
//   scorerId: string;
//   scoredUserId: string | null;
//   scoredUserName: string;
//   scoredUserEmail: string;
//   score: number;
//   eligible: boolean;
//   loanAwarded: boolean;
//   awardedAmount: number | null;
//   dueDate: string | null;
//   loanTaken: boolean | null;
//   repaymentStatus: string | null;
//   notes: string;
//   createdAt: string;
//   updatedAt: string;
//   scorerName: string;
//   scoreData: {
//     gender: string;
//     maritalStatus: string;
//     dependents: number;
//     education: string;
//     employmentStatus: string;
//     income: number;
//     coApplicantIncome: number;
//     loanAmount: number;
//     loanTerm: number;
//     creditHistory: boolean;
//     propertyArea: string;
//   };
// }

interface ScoreDetail {
            id: string
            scoreduserId: string,
            scorerId: string,
            amount: number,
            term: number,
            gender: Gender,
            maritalStatus: MaritalStatus,
            dependents: number,
            education: Education,
            employmentStatus: EmploymentStatus,
            income: number,
            coApplicantIncome: number,
            creditHistory: boolean,
            propertyArea: PropertyArea,
            score: number,
            eligible: boolean,
            decisionStatus: DecisionStatus,
            awardedAmount: number,
            dueDate: string,
            outcomeStatus: LoanOutcome,
            notes: string,
            createdAt: string,
            updatedAt: string,
            scoreData: {
                eligible: string,
                score: number,
                explanation: string
            }
};

const ScoreDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [score, setScore] = useState<ScoreDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showLoanModal, setShowLoanModal] = useState(false);
  const [showRepaymentModal, setShowRepaymentModal] = useState(false);
  const { getUserById, updateScoreStatus } = useData();
  const { showToast } = useToast();
  const [scoredUser, setScoredUser] = useState<any>(null);
  const [scorer, setScorer] = useState<any>(null);

  const [loanData, setLoanData] = useState({
    actualAmount: 0,
    startDate: '',
    agreedDueDate: ''
  });
  const [loanTaken, setLoanTaken] = useState<'yes' | 'no' | null>(null);

  const [repaymentData, setRepaymentData] = useState({
    status: '',
    completedDate: '',
    notes: ''
  });

  const [loanModalLoading, setLoanModalLoading] = useState(false);
  const [repaymentModalLoading, setRepaymentModalLoading] = useState(false);

  useEffect(() => {
    const fetchScore = async () => {
      if (!id) return;
      
      try {
        setIsLoading(true);
        const response = await getScoreById(id);
        console.log(response.data)
        setScore(response.data);
        if(response.data.scoreduserId){
          const data = getUserById(response.data.scoreduserId)
          if(data) setScoredUser(data)
        }
          if(response.data.scorerId){
          const data = getUserById(response.data.scorerId)
          if(data) setScorer(data)
        }
      } catch (err: any) {
        const errorMessage = err.response?.data?.detail || 'Failed to load score details';
        setError(errorMessage);
        showToast(errorMessage, 'error');
        console.error('Failed to load score details:', err);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchScore();
  }, [id]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getRepaymentBadge = (status: string | null) => {
    if (!status) return <span className="px-3 py-1 text-sm rounded-full bg-gray-100 text-gray-800">Pending</span>;
    
    switch (status) {
      case 'PAID':
        return <span className="px-3 py-1 text-sm rounded-full bg-green-100 text-green-800">Paid</span>;
      case 'DEFAULTED':
        return <span className="px-3 py-1 text-sm rounded-full bg-red-100 text-red-800">Defaulted</span>;
      case 'IN_PROGRESS':
        return <span className="px-3 py-1 text-sm rounded-full bg-blue-100 text-blue-800">In Progress</span>;
      case 'OVERDUE':
        return <span className="px-3 py-1 text-sm rounded-full bg-orange-100 text-orange-800">Overdue</span>;
      default:
        return <span className="px-3 py-1 text-sm rounded-full bg-gray-100 text-gray-800">Unknown</span>;
    }
  };
  const handleRecordLoanTaken = async () => {
    if (!score || !loanTaken) return;
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
      
      await updateScoreStatus(score.id, statusUpdate);
      setShowLoanModal(false);
      setLoanTaken(null);
      // Refresh score data
      const response = await getScoreById(score.id);
      setScore(response.data);
    } catch (error: any) {
      showToast(error.response?.data?.detail || 'Failed to record loan', 'error');
      console.error('Failed to record loan:', error);
    } finally {
      setLoanModalLoading(false);
    }
  };
  const handleUpdateRepaymentStatus = async () => {
    if (!score) return;
    setRepaymentModalLoading(true);
    try {
      const statusUpdate = {
        outcomeStatus: repaymentData.status,
        notes: repaymentData.notes
      };
      
      await updateScoreStatus(score.id, statusUpdate);
      setShowRepaymentModal(false);
      setRepaymentData({
        status: '',
        completedDate: '',
        notes: ''
      });
      // Refresh score data
      const response = await getScoreById(score.id);
      setScore(response.data);
    } catch (error: any) {
      showToast(error.response?.data?.detail || 'Failed to update repayment status', 'error');
      console.error('Failed to update repayment status:', error);
    } finally {
      setRepaymentModalLoading(false);
    }
  };

  const handleOpenLoanModal = () => {
    // Prefill the modal with existing loan data
    const hasExistingLoan = score?.decisionStatus === 'AWARDED_AND_TAKEN';
    setLoanTaken(hasExistingLoan ? 'yes' : null);
    setLoanData({
      actualAmount: score?.awardedAmount || 0,
      startDate: score?.dueDate ? new Date(score.dueDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      agreedDueDate: score?.dueDate ? new Date(score.dueDate).toISOString().split('T')[0] : ''
    });
    setShowLoanModal(true);
  };

  const handleOpenRepaymentModal = () => {
    // Prefill the modal with existing repayment data
    setRepaymentData({
      status: score?.outcomeStatus || '',
      completedDate: score?.dueDate ? new Date(score.dueDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      notes: score?.notes || ''
    });
    setShowRepaymentModal(true);
  };

  const isScorer = user?.id === score?.scorerId;
  const isScoredUser = user?.id === score?.scoreduserId;


  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-sky-500"></div>
      </div>
    );
  }

  if (error || !score) {
    // Error is now shown via toast, just show a fallback UI
    return (
      <div className="max-w-4xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h3 className="text-lg font-medium text-red-800 mb-2">Error</h3>
          <p className="text-red-700">An error occurred. Please try again later.</p>
          <button
            onClick={() => navigate('/my-scores')}
            className="mt-4 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
          >
            Back to Scores
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Credit Score Details</h1>
            <p className="text-gray-600 mt-1">
              Score ID: {score.id.slice(0, 8)}...
            </p>
          </div>
          <button
            onClick={() => navigate(-1)}
            className="text-gray-600 hover:text-gray-900 font-medium"
          >
            ← Back
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Score Summary */}
        <div className="lg:col-span-2">
          <div className="bg-white shadow rounded-lg p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Score Summary</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="text-center p-6 bg-gradient-to-br from-sky-50 to-teal-50 rounded-lg">
                <div className="text-4xl font-bold text-sky-600 mb-2">
                  {(score.score * 100).toFixed(1)}%
                </div>
                <div className="text-sm text-gray-600">Credit Score</div>
              </div>
              
              <div className="text-center p-6 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg">
                <div className={`text-2xl font-bold mb-2 ${score.eligible ? 'text-green-600' : 'text-red-600'}`}>
                  {score.eligible ? 'ELIGIBLE' : 'NOT ELIGIBLE'}
                </div>
                <div className="text-sm text-gray-600">AI Recommendation</div>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Scorer</label>
                <p className="text-gray-900">{scorer && scorer.fullName || ""}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Scored User</label>
                <p className="text-gray-900">{scoredUser && scoredUser.fullName || ""}</p>
                {scoredUser && (
                  <p className="text-sm text-gray-500">{scoredUser.email}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Score Date</label>
                <p className="text-gray-900">{formatDate(score.createdAt)}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Last Updated</label>
                <p className="text-gray-900">{formatDate(score.updatedAt)}</p>
              </div>
            </div>

            {score.notes && (
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
                <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">{score.notes}</p>
              </div>
            )}
          </div>

          {/* Score Data Details */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Scoring Data</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-3">Personal Information</h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Gender</label>
                    <p className="text-gray-900">{score.gender}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Marital Status</label>
                    <p className="text-gray-900">{score.maritalStatus}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Dependents</label>
                    <p className="text-gray-900">{score.dependents}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Education</label>
                    <p className="text-gray-900">{score.education}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Property Area</label>
                    <p className="text-gray-900">{score.propertyArea}</p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-3">Financial Information</h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Employment Status</label>
                    <p className="text-gray-900">{score.employmentStatus}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Monthly Income</label>
                    <p className="text-gray-900">XAF {score.income.toLocaleString()}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Co-Applicant Income</label>
                    <p className="text-gray-900">XAF {score.coApplicantIncome.toLocaleString()}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Requested Loan Amount</label>
                    <p className="text-gray-900">XAF {(score.amount*1000).toLocaleString()}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Loan Term</label>
                    <p className="text-gray-900">{score.term} months</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Credit History</label>
                    <p className={`font-medium ${score.creditHistory ? 'text-green-600' : 'text-red-600'}`}>
                      {score.creditHistory ? 'Good' : 'Poor'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Loan Status Sidebar */}
        <div className="space-y-6">
          {/* Loan Decision */}
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Loan Decision</h3>
            
            <div className="space-y-4">              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                {score.decisionStatus === 'AWARDED' || score.decisionStatus === 'AWARDED_AND_TAKEN' ? (
                  <span className="px-3 py-1 text-sm rounded-full bg-green-100 text-green-800">
                    Loan Awarded
                  </span>
                ) : score.decisionStatus === 'DECLINED' ? (
                  <span className="px-3 py-1 text-sm rounded-full bg-red-100 text-red-800">
                    Loan Declined
                  </span>
                ) : (
                  <span className="px-3 py-1 text-sm rounded-full bg-yellow-100 text-yellow-800">
                    Pending Decision
                  </span>
                )}
              </div>
              
              {(score.decisionStatus === 'AWARDED' || score.decisionStatus === 'AWARDED_AND_TAKEN') && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Awarded Amount</label>
                    <p className="text-lg font-semibold text-gray-900">
                      XAF {score.awardedAmount?.toLocaleString()}
                    </p>
                  </div>
                  
                  {score.dueDate && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
                      <p className="text-gray-900">
                        {new Date(score.dueDate).toLocaleDateString()}
                      </p>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>          {/* Loan Tracking */}
          {(score.decisionStatus === 'AWARDED' || score.decisionStatus === 'AWARDED_AND_TAKEN') && (
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Loan Tracking</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Loan Status</label>
                  {score.decisionStatus === 'AWARDED' ? (
                    <span className="px-3 py-1 text-sm rounded-full bg-yellow-100 text-yellow-800">
                      Pending Response
                    </span>
                  ) : score.decisionStatus === 'AWARDED_AND_TAKEN' ? (
                    <span className="px-3 py-1 text-sm rounded-full bg-blue-100 text-blue-800">
                      Loan Taken
                    </span>
                  ) : (
                    <span className="px-3 py-1 text-sm rounded-full bg-gray-100 text-gray-800">
                      Loan Declined by User
                    </span>
                  )}
                </div>
                
                {score.decisionStatus === 'AWARDED_AND_TAKEN' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Repayment Status</label>
                    {getRepaymentBadge(score.outcomeStatus)}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="mt-6 space-y-2">
                {isScoredUser && score.decisionStatus === 'AWARDED' && (
                  <button
                    onClick={handleOpenLoanModal}
                    className="w-full bg-gradient-to-r from-sky-500 to-teal-500 text-white px-4 py-2 rounded-lg font-medium hover:from-sky-600 hover:to-teal-600"
                  >
                    Record Loan Status
                  </button>
                )}
                
                {score.decisionStatus === 'AWARDED_AND_TAKEN' && (isScorer || isScoredUser) && (
                  <button
                    onClick={handleOpenRepaymentModal}
                    className="w-full border border-gray-300 text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-50"
                  >
                    Update Repayment Status
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Loan Recording Modal */}
      {showLoanModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black/40" />
          <div className="relative z-10 p-5 border w-96 shadow-lg rounded-md bg-white">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Record Loan Status</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Did you take this loan?</label>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="loanTaken"
                      value="yes"
                      checked={loanTaken === 'yes'}
                      onChange={() => {
                        setLoanTaken('yes');
                        setLoanData(prev => ({ ...prev, actualAmount: score?.awardedAmount || 0 }));
                      }}
                      className="mr-2"
                    />
                    Yes, I took the loan
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
                      className="mr-2"
                    />
                    No, I declined the loan
                  </label>
                </div>
              </div>
              
              {loanTaken === 'yes' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Actual Loan Amount ($)</label>
                    <input
                      type="number"
                      value={loanData.actualAmount}
                      onChange={(e) => setLoanData(prev => ({ ...prev, actualAmount: parseFloat(e.target.value) || 0 }))}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
                    <input
                      type="date"
                      value={loanData.startDate}
                      onChange={(e) => setLoanData(prev => ({ ...prev, startDate: e.target.value }))}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Agreed Due Date</label>
                    <input
                      type="date"
                      value={loanData.agreedDueDate}
                      onChange={(e) => setLoanData(prev => ({ ...prev, agreedDueDate: e.target.value }))}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                    />
                  </div>
                </>
              )}
            </div>
            <div className="flex space-x-4 mt-6">
              <button
                onClick={handleRecordLoanTaken}
                className="bg-gradient-to-r from-sky-500 to-teal-500 text-white px-4 py-2 rounded-lg font-medium hover:from-sky-600 hover:to-teal-600 disabled:opacity-60 flex items-center justify-center"
                disabled={loanModalLoading}
              >
                {loanModalLoading ? (<span className="flex items-center"><svg className="animate-spin h-5 w-5 mr-2 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path></svg>Saving...</span>) : 'Save'}
              </button>
              <button
                onClick={() => {
                  setShowLoanModal(false);
                  setLoanTaken(null);
                  setLoanData({ actualAmount: 0, startDate: '', agreedDueDate: '' });
                }}
                className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-50"
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
          <div className="relative z-10 p-5 border w-96 shadow-lg rounded-md bg-white">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Update Repayment Status</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Repayment Status</label>
                <select
                  value={repaymentData.status}
                  onChange={(e) => setRepaymentData(prev => ({ ...prev, status: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-sky-500 focus:border-transparent"
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">Completion Date</label>
                  <input
                    type="date"
                    value={repaymentData.completedDate}
                    onChange={(e) => setRepaymentData(prev => ({ ...prev, completedDate: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                  />
                </div>
              )}
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
                <textarea
                  value={repaymentData.notes}
                  onChange={(e) => setRepaymentData(prev => ({ ...prev, notes: e.target.value }))}
                  rows={3}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                  placeholder="Optional notes..."
                />
              </div>
            </div>
            <div className="flex space-x-4 mt-6">
              <button
                onClick={handleUpdateRepaymentStatus}
                className="bg-gradient-to-r from-sky-500 to-teal-500 text-white px-4 py-2 rounded-lg font-medium hover:from-sky-600 hover:to-teal-600 disabled:opacity-60 flex items-center justify-center"
                disabled={repaymentModalLoading}
              >
                {repaymentModalLoading ? (<span className="flex items-center"><svg className="animate-spin h-5 w-5 mr-2 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path></svg>Updating...</span>) : 'Update'}
              </button>
              <button
                onClick={() => {
                  setShowRepaymentModal(false);
                  setRepaymentData({ status: '', completedDate: '', notes: '' });
                }}
                className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-50"
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

export default ScoreDetails;