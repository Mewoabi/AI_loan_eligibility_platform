import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getPendingLoanApplications } from '../../services/api';

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
};

const ScoreApplications: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [applications, setApplications] = useState<LoanApplication[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'recent' | 'amount_high' | 'amount_low'>('all');
  
  useEffect(() => {
    const fetchPendingApplications = async () => {
      if (!user) return;
      
      try {
        setIsLoading(true);
        const response = await getPendingLoanApplications();
        setApplications(response.data);
      } catch (err: any) {
        setError(err.response?.data?.detail || 'Failed to load pending loan applications');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchPendingApplications();
  }, [user]);
  
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };
  
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };
  
  const filteredApplications = applications
    // Filter out user's own applications
    .filter(app => app.scoreduserId !== user?.id)
    // Filter by search term
    .filter(app => 
      searchTerm === '' || 
      app.scoreduserFullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.id.toLowerCase().includes(searchTerm.toLowerCase())
    )
    // Sort based on selected filter
    .sort((a, b) => {
      switch (selectedFilter) {
        case 'recent':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'amount_high':
          return b.amount - a.amount;
        case 'amount_low':
          return a.amount - b.amount;
        default:
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
    });
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div className="px-4 py-6 sm:px-0">
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6 bg-gradient-to-r from-blue-600 to-indigo-700">
            <h3 className="text-lg leading-6 font-medium text-white">
              Score Loan Applications
            </h3>
            <p className="mt-1 max-w-2xl text-sm text-blue-100">
              Review and score pending loan applications from other users
            </p>
          </div>
          
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
          
          {/* Search and Filter */}
          <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div className="flex-1 min-w-0 mb-4 sm:mb-0">
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <input
                    type="text"
                    placeholder="Search by name or ID"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
                  />
                </div>
              </div>
              
              <div className="flex items-center">
                <span className="text-gray-700 text-sm font-medium mr-2">Sort by:</span>
                <select
                  value={selectedFilter}
                  onChange={(e) => setSelectedFilter(e.target.value as any)}
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                >
                  <option value="recent">Most Recent</option>
                  <option value="amount_high">Amount (High to Low)</option>
                  <option value="amount_low">Amount (Low to High)</option>
                </select>
              </div>
            </div>
          </div>
          
          {/* Applications List */}
          {filteredApplications.length === 0 ? (
            <div className="px-4 py-16 text-center">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No applications found</h3>
              <p className="mt-1 text-sm text-gray-500">
                There are no pending loan applications to score at this time.
              </p>
            </div>
          ) : (
            <ul className="divide-y divide-gray-200">
              {filteredApplications.map((application) => (
                <li key={application.id} className="hover:bg-gray-50">
                  <div className="px-4 py-4 sm:px-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gradient-to-r from-purple-400 to-indigo-500 flex items-center justify-center text-white font-bold">
                          {application.scoreduserFullName.charAt(0)}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-indigo-600 truncate">
                            {application.scoreduserFullName}
                          </div>
                          <div className="text-xs text-gray-500">
                            ID: {application.id.substring(0, 8)}...
                          </div>
                        </div>
                      </div>
                      <div className="flex">
                        <div className="ml-2 flex-shrink-0">
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-orange-100 text-orange-800">
                            Pending Review
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-4 sm:flex sm:justify-between">
                      <div className="sm:flex">
                        <div className="mr-6 flex items-center text-sm text-gray-500">
                          <svg className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
                          </svg>
                          Loan Amount: <span className="font-medium text-gray-900 ml-1">{formatCurrency(application.amount)}</span>
                        </div>
                        <div className="mt-2 sm:mt-0 mr-6 flex items-center text-sm text-gray-500">
                          <svg className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                          </svg>
                          Term: <span className="font-medium text-gray-900 ml-1">{application.term} months</span>
                        </div>
                        <div className="mt-2 sm:mt-0 flex items-center text-sm text-gray-500">
                          <svg className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                          </svg>
                          Applied: <span className="font-medium text-gray-900 ml-1">{formatDate(application.createdAt)}</span>
                        </div>
                      </div>
                      <div className="mt-4 sm:mt-0">
                        <button
                          onClick={() => navigate(`/loans/${application.id}?score=true`)}
                          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                          Review & Score
                        </button>
                      </div>
                    </div>
                    
                    {/* Quick Info Row */}
                    <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4 text-xs text-gray-500">
                      <div>
                        <span className="font-medium">Employment:</span> {' '}
                        {application.employmentStatus.replace('_', ' ')}
                      </div>
                      <div>
                        <span className="font-medium">Education:</span> {' '}
                        {application.education.replace('_', ' ')}
                      </div>
                      <div>
                        <span className="font-medium">Income:</span> {' '}
                        {formatCurrency(application.income)}
                      </div>
                      <div>
                        <span className="font-medium">Credit History:</span> {' '}
                        {application.creditHistory ? 'Good' : 'Poor'}
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default ScoreApplications;