import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getUserLoanApplications } from '../../services/api';

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

const MyApplications: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [applications, setApplications] = useState<LoanApplication[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'initiated' | 'scored'>('initiated');
  
  useEffect(() => {
    const fetchApplications = async () => {
      if (!user) return;
      
      try {
        setIsLoading(true);
        const response = await getUserLoanApplications();
        setApplications(response.data);
      } catch (err: any) {
        setError(err.response?.data?.detail || 'Failed to load loan applications');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchApplications();
  }, [user]);
  
  const initiatedApplications = applications.filter(app => app.scoreduserId === user?.id);
  const scoredApplications = applications.filter(app => app.scorerId === user?.id);
  
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };
  
  const getStatusBadge = (status: string | null) => {
    if (!status) return <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800">Pending</span>;
    
    switch (status) {
      case 'AWARDED':
        return <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">Awarded</span>;
      case 'DECLINED':
        return <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-800">Declined</span>;
      case 'PENDING':
      default:
        return <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800">Pending</span>;
    }
  };

  const getOutcomeBadge = (status: string | null) => {
    if (!status) return null;
    
    switch (status) {
      case 'PAID':
        return <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">Paid</span>;
      case 'DEFAULTED':
        return <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-800">Defaulted</span>;
      case 'IN_PROGRESS':
        return <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">In Progress</span>;
      default:
        return null;
    }
  };
  
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
            <div className="flex justify-between items-center">
              <h3 className="text-lg leading-6 font-medium text-white">My Loan Applications</h3>
              <Link
                to="/apply"
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-indigo-500 hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Apply for a Loan
              </Link>
            </div>
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
          
          {/* Tabs */}
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex" aria-label="Tabs">
              <button
                onClick={() => setActiveTab('initiated')}
                className={`${
                  activeTab === 'initiated'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } w-1/2 py-4 px-1 text-center border-b-2 font-medium text-sm`}
              >
                My Loan Applications ({initiatedApplications.length})
              </button>
              <button
                onClick={() => setActiveTab('scored')}
                className={`${
                  activeTab === 'scored'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } w-1/2 py-4 px-1 text-center border-b-2 font-medium text-sm`}
              >
                Loans I've Reviewed ({scoredApplications.length})
              </button>
            </nav>
          </div>
          
          {/* Applications Table */}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ID
                  </th>
                  {activeTab === 'scored' && (
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Applicant
                    </th>
                  )}
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    AI Eligibility
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {(activeTab === 'initiated' ? initiatedApplications : scoredApplications).map((application) => (
                  <tr key={application.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {application.id.substring(0, 8)}...
                    </td>
                    {activeTab === 'scored' && (
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {application.scoreduserFullName || 'Unknown User'}
                      </td>
                    )}
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      ${application.amount.toLocaleString()}
                      {application.awardedAmount !== null && application.awardedAmount !== application.amount && (
                        <span className="ml-2 text-xs text-indigo-600">
                          (Awarded: ${application.awardedAmount.toLocaleString()})
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(application.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col space-y-1">
                        {getStatusBadge(application.decisionStatus)}
                        {application.decisionStatus === 'AWARDED' && getOutcomeBadge(application.outcomeStatus)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {application.eligible !== null ? (
                        <div className="flex items-center">
                          <span className={`text-sm ${application.eligible ? 'text-green-700' : 'text-red-700'}`}>
                            {application.score !== null ? (application.score * 100).toFixed(2) + '%' : '-'}
                          </span>
                        </div>
                      ) : (
                        <span className="text-gray-400">Not scored</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => navigate(`/loans/${application.id}`)}
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
                
                {/* Empty State */}
                {((activeTab === 'initiated' && initiatedApplications.length === 0) ||
                  (activeTab === 'scored' && scoredApplications.length === 0)) && (
                  <tr>
                    <td colSpan={activeTab === 'scored' ? 7 : 6} className="px-6 py-10 text-center text-sm text-gray-500">
                      <div className="flex flex-col items-center justify-center">
                        <svg className="h-10 w-10 text-gray-400" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" viewBox="0 0 24 24" stroke="currentColor">
                          <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <h3 className="mt-2 text-sm font-medium text-gray-900">No applications found</h3>
                        {activeTab === 'initiated' ? (
                          <p className="mt-1 text-sm text-gray-500">Get started by applying for a loan.</p>
                        ) : (
                          <p className="mt-1 text-sm text-gray-500">You haven't reviewed any loan applications yet.</p>
                        )}
                        {activeTab === 'initiated' && (
                          <div className="mt-6">
                            <Link
                              to="/apply"
                              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                            >
                              <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                              </svg>
                              Apply Now
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
    </div>
  );
};

export default MyApplications;