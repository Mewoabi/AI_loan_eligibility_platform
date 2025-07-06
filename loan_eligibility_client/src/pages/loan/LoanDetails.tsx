import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getLoanApplication, updateLoanApplication } from '../../services/api';

type LoanApplication = {
  id: string;
  scoreduserId: string;
  scorerId: string | null;
  amount: number;
  term: number;
  gender: string;
  maritalStatus: string;
  dependents: number;
  education: string;
  employmentStatus: string;
  income: number;
  coApplicantIncome: number;
  creditHistory: boolean;
  propertyArea: string;
  score: number | null;
  eligible: boolean | null;
  decisionStatus: string | null;
  awardedAmount: number | null;
  dueDate: string | null;
  outcomeStatus: string | null;
  createdAt: string;
  updatedAt: string;
  scoreduserFullName: string;
  scorerFullName: string | null;
};

const LoanDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [loan, setLoan] = useState<LoanApplication | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Form values for updating loan
  const [decisionStatus, setDecisionStatus] = useState<string>('PENDING');
  const [awardedAmount, setAwardedAmount] = useState<number>(0);
  const [dueDate, setDueDate] = useState<string>('');
  const [outcomeStatus, setOutcomeStatus] = useState<string>('IN_PROGRESS');
  
  useEffect(() => {
    const fetchLoanDetails = async () => {
      if (!id) return;
      
      try {
        setIsLoading(true);
        const response = await getLoanApplication(id);
        setLoan(response.data);
        
        // Initialize form values with existing data
        setDecisionStatus(response.data.decisionStatus || 'PENDING');
        setAwardedAmount(response.data.awardedAmount || response.data.amount);
        setDueDate(response.data.dueDate ? new Date(response.data.dueDate).toISOString().split('T')[0] : '');
        setOutcomeStatus(response.data.outcomeStatus || 'IN_PROGRESS');
      } catch (err: any) {
        setError(err.response?.data?.detail || 'Failed to load loan application details');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchLoanDetails();
  }, [id]);
  
  const isApplicant = loan?.scoreduserId === user?.id;
  const isScorer = loan?.scorerId === user?.id || (!loan?.scorerId && !isApplicant);
  
  const handleDecisionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    
    setIsSaving(true);
    setError(null);
    setSuccess(null);
    
    try {
      const updateData = {
        decision_status: decisionStatus,
        awarded_amount: parseFloat(awardedAmount.toString()),
        due_date: dueDate ? new Date(dueDate).toISOString() : undefined,
      };
      
      await updateLoanApplication(id, updateData);
      setSuccess('Loan decision updated successfully!');
      
      // Refresh loan data
      const response = await getLoanApplication(id);
      setLoan(response.data);
      
      // Clear success message after delay
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to update loan decision');
    } finally {
      setIsSaving(false);
    }
  };
  
  const handleStatusUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    
    setIsSaving(true);
    setError(null);
    setSuccess(null);
    
    try {
      const updateData = {
        outcome_status: outcomeStatus,
      };
      
      await updateLoanApplication(id, updateData);
      setSuccess('Loan status updated successfully!');
      
      // Refresh loan data
      const response = await getLoanApplication(id);
      setLoan(response.data);
      
      // Clear success message after delay
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to update loan status');
    } finally {
      setIsSaving(false);
    }
  };
  
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };
  
  const getStatusBadgeColor = (status: string | null) => {
    if (!status) return 'bg-gray-100 text-gray-800';
    
    switch (status) {
      case 'AWARDED':
        return 'bg-green-100 text-green-800';
      case 'DECLINED':
        return 'bg-red-100 text-red-800';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getOutcomeBadgeColor = (status: string | null) => {
    if (!status) return 'bg-gray-100 text-gray-800';
    
    switch (status) {
      case 'PAID':
        return 'bg-green-100 text-green-800';
      case 'DEFAULTED':
        return 'bg-red-100 text-red-800';
      case 'IN_PROGRESS':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }
  
  if (error && !loan) {
    return (
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="rounded-md bg-red-50 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">{error}</h3>
                <div className="mt-4">
                  <button
                    type="button"
                    className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    onClick={() => navigate(-1)}
                  >
                    Go Back
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  if (!loan) {
    return null;
  }

  return (
    <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div className="px-4 py-6 sm:px-0">
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6 bg-gradient-to-r from-blue-600 to-indigo-700">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg leading-6 font-medium text-white">
                  Loan Application Details
                </h3>
                <p className="mt-1 max-w-2xl text-sm text-blue-100">
                  Application #{loan.id.substring(0, 8)}
                </p>
              </div>
              <button
                type="button"
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-indigo-500 hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                onClick={() => navigate(-1)}
              >
                Back
              </button>
            </div>
          </div>
          
          {/* Notifications */}
          {error && (
            <div className="rounded-md bg-red-50 m-4 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">{error}</h3>
                </div>
              </div>
            </div>
          )}
          
          {success && (
            <div className="rounded-md bg-green-50 m-4 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-green-800">{success}</h3>
                </div>
              </div>
            </div>
          )}
          
          {/* Status Cards */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 px-4 py-5 sm:p-6">
            {/* Decision Status Card */}
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <dt className="text-sm font-medium text-gray-500 truncate">
                  Decision Status
                </dt>
                <dd className="mt-1">
                  <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeColor(loan.decisionStatus)}`}>
                    {loan.decisionStatus || 'Pending'}
                  </span>
                </dd>
              </div>
            </div>
            
            {/* AI Eligibility Card */}
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <dt className="text-sm font-medium text-gray-500 truncate">
                  AI Eligibility Score
                </dt>
                <dd className="mt-1 text-xl font-semibold">
                  {loan.score !== null ? (
                    <div className="flex items-center">
                      <span>{(loan.score * 100).toFixed(2)}%</span>
                      {loan.eligible !== null && (
                        <span className={`ml-2 px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${loan.eligible ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                          {loan.eligible ? 'Eligible' : 'Not Eligible'}
                        </span>
                      )}
                    </div>
                  ) : (
                    'Not yet scored'
                  )}
                </dd>
              </div>
            </div>
            
            {/* Loan Status Card */}
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <dt className="text-sm font-medium text-gray-500 truncate">
                  Loan Status
                </dt>
                <dd className="mt-1">
                  <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getOutcomeBadgeColor(loan.outcomeStatus)}`}>
                    {loan.outcomeStatus || 'Not Started'}
                  </span>
                </dd>
              </div>
            </div>
          </div>
          
          {/* Loan Details Section */}
          <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
            <dl className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2">
              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-gray-500">
                  Applicant
                </dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {loan.scoreduserFullName || 'Anonymous User'}
                </dd>
              </div>
              
              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-gray-500">
                  Reviewer
                </dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {loan.scorerFullName || 'Not yet assigned'}
                </dd>
              </div>
              
              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-gray-500">
                  Applied on
                </dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {formatDate(loan.createdAt)}
                </dd>
              </div>
              
              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-gray-500">
                  Last Updated
                </dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {formatDate(loan.updatedAt)}
                </dd>
              </div>
              
              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-gray-500">
                  Requested Amount
                </dt>
                <dd className="mt-1 text-sm text-gray-900">
                  ${loan.amount.toLocaleString()}
                </dd>
              </div>
              
              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-gray-500">
                  Awarded Amount
                </dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {loan.awardedAmount ? `$${loan.awardedAmount.toLocaleString()}` : 'Not yet awarded'}
                </dd>
              </div>
              
              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-gray-500">
                  Loan Term
                </dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {loan.term} months
                </dd>
              </div>
              
              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-gray-500">
                  Due Date
                </dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {loan.dueDate ? formatDate(loan.dueDate) : 'Not set'}
                </dd>
              </div>
              
              <div className="sm:col-span-2">
                <dt className="text-sm font-medium text-gray-500">
                  Applicant Details
                </dt>
                <dd className="mt-1 text-sm text-gray-900 bg-gray-50 rounded-md p-4">
                  <dl className="grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-2">
                    <div className="sm:col-span-1">
                      <dt className="text-xs text-gray-500">Gender</dt>
                      <dd>{loan.gender}</dd>
                    </div>
                    
                    <div className="sm:col-span-1">
                      <dt className="text-xs text-gray-500">Marital Status</dt>
                      <dd>{loan.maritalStatus}</dd>
                    </div>
                    
                    <div className="sm:col-span-1">
                      <dt className="text-xs text-gray-500">Dependents</dt>
                      <dd>{loan.dependents}</dd>
                    </div>
                    
                    <div className="sm:col-span-1">
                      <dt className="text-xs text-gray-500">Education</dt>
                      <dd>{loan.education}</dd>
                    </div>
                    
                    <div className="sm:col-span-1">
                      <dt className="text-xs text-gray-500">Employment</dt>
                      <dd>{loan.employmentStatus}</dd>
                    </div>
                    
                    <div className="sm:col-span-1">
                      <dt className="text-xs text-gray-500">Income</dt>
                      <dd>${loan.income.toLocaleString()}</dd>
                    </div>
                    
                    <div className="sm:col-span-1">
                      <dt className="text-xs text-gray-500">Co-Applicant Income</dt>
                      <dd>${loan.coApplicantIncome.toLocaleString()}</dd>
                    </div>
                    
                    <div className="sm:col-span-1">
                      <dt className="text-xs text-gray-500">Credit History</dt>
                      <dd>{loan.creditHistory ? 'Good' : 'Poor'}</dd>
                    </div>
                    
                    <div className="sm:col-span-1">
                      <dt className="text-xs text-gray-500">Property Area</dt>
                      <dd>{loan.propertyArea}</dd>
                    </div>
                  </dl>
                </dd>
              </div>
            </dl>
          </div>
          
          {/* Loan Decision Form (for scorers) */}
          {isScorer && (
            <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Make Decision
              </h3>
              <p className="mt-1 max-w-2xl text-sm text-gray-500">
                Review the application and provide your decision
              </p>
              
              <form onSubmit={handleDecisionSubmit} className="mt-5 space-y-6">
                <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                  <div className="sm:col-span-3">
                    <label htmlFor="decisionStatus" className="block text-sm font-medium text-gray-700">
                      Decision Status
                    </label>
                    <select
                      id="decisionStatus"
                      name="decisionStatus"
                      value={decisionStatus}
                      onChange={(e) => setDecisionStatus(e.target.value)}
                      className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    >
                      <option value="PENDING">Pending</option>
                      <option value="AWARDED">Awarded</option>
                      <option value="DECLINED">Declined</option>
                    </select>
                  </div>
                  
                  {decisionStatus === 'AWARDED' && (
                    <>
                      <div className="sm:col-span-3">
                        <label htmlFor="awardedAmount" className="block text-sm font-medium text-gray-700">
                          Award Amount
                        </label>
                        <div className="mt-1 relative rounded-md shadow-sm">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <span className="text-gray-500 sm:text-sm">$</span>
                          </div>
                          <input
                            type="number"
                            name="awardedAmount"
                            id="awardedAmount"
                            min="0"
                            value={awardedAmount}
                            onChange={(e) => setAwardedAmount(parseFloat(e.target.value) || 0)}
                            className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-7 sm:text-sm border-gray-300 rounded-md"
                          />
                        </div>
                      </div>
                      
                      <div className="sm:col-span-3">
                        <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700">
                          Due Date
                        </label>
                        <input
                          type="date"
                          name="dueDate"
                          id="dueDate"
                          value={dueDate}
                          onChange={(e) => setDueDate(e.target.value)}
                          className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                        />
                      </div>
                    </>
                  )}
                </div>
                
                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={isSaving}
                    className={`inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
                      isSaving ? 'bg-gray-400' : 'bg-indigo-600 hover:bg-indigo-700'
                    }`}
                  >
                    {isSaving ? 'Saving...' : 'Save Decision'}
                  </button>
                </div>
              </form>
            </div>
          )}
          
          {/* Loan Status Update Form (for applicants) */}
          {isApplicant && loan.decisionStatus === 'AWARDED' && (
            <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Update Loan Status
              </h3>
              <p className="mt-1 max-w-2xl text-sm text-gray-500">
                Please update the status of your loan as needed
              </p>
              
              <form onSubmit={handleStatusUpdate} className="mt-5 space-y-6">
                <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                  <div className="sm:col-span-3">
                    <label htmlFor="outcomeStatus" className="block text-sm font-medium text-gray-700">
                      Loan Status
                    </label>
                    <select
                      id="outcomeStatus"
                      name="outcomeStatus"
                      value={outcomeStatus}
                      onChange={(e) => setOutcomeStatus(e.target.value)}
                      className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    >
                      <option value="IN_PROGRESS">In Progress</option>
                      <option value="PAID">Paid</option>
                      <option value="DEFAULTED">Defaulted</option>
                    </select>
                  </div>
                </div>
                
                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={isSaving}
                    className={`inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
                      isSaving ? 'bg-gray-400' : 'bg-indigo-600 hover:bg-indigo-700'
                    }`}
                  >
                    {isSaving ? 'Updating...' : 'Update Status'}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LoanDetails;