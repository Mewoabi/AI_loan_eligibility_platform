import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getProfile, createLoanApplication } from '../../services/api';

type FormValues = {
  gender: string;
  maritalStatus: string;
  dependents: number;
  education: string;
  employmentStatus: string;
  income: number;
  coApplicantIncome: number;
  loanAmount: number;
  loanTerm: number;
  creditHistory: boolean;
  propertyArea: string;
};

type PredictionResult = {
  eligible: boolean;
  score: number;
  explanation: string;
};

type LocationState = {
  formData?: FormValues;
  prediction?: PredictionResult;
};

const ApplyLoan: React.FC = () => {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as LocationState;
  
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [profileLoaded, setProfileLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Initialize form with values from state if available (from quick score)
  const [formValues, setFormValues] = useState<FormValues>(
    state?.formData || {
      gender: 'MALE',
      maritalStatus: 'SINGLE',
      dependents: 0,
      education: 'GRADUATE',
      employmentStatus: 'EMPLOYED',
      income: 0,
      coApplicantIncome: 0,
      loanAmount: 0,
      loanTerm: 12,
      creditHistory: true,
      propertyArea: 'URBAN'
    }
  );

  // Store the prediction result if available from the quick score
  const [predictionResult, setPredictionResult] = useState<PredictionResult | null>(
    state?.prediction || null
  );
  
  // Load user profile data on component mount if not coming from quick score
  useEffect(() => {
    const loadProfile = async () => {
      // Skip profile loading if form data is already provided from quick score
      if (state?.formData) {
        setProfileLoaded(true);
        return;
      }
      
      try {
        setIsLoading(true);
        const response = await getProfile();
        
        // Map profile data to form values - now using camelCase
        setFormValues({
          gender: response.data.gender || 'MALE',
          maritalStatus: response.data.maritalStatus || 'SINGLE',
          dependents: response.data.dependents || 0,
          education: response.data.education || 'GRADUATE',
          employmentStatus: response.data.employmentStatus || 'EMPLOYED',
          income: response.data.income || 0,
          coApplicantIncome: response.data.coApplicantIncome || 0,
          loanAmount: 0, // This should be filled by the user
          loanTerm: 12,  // Default to 12 months
          creditHistory: response.data.creditHistory ?? true,
          propertyArea: response.data.propertyArea || 'URBAN'
        });
        
        setProfileLoaded(true);
      } catch (err: any) {
        if (err.response?.status === 404) {
          // Profile doesn't exist, redirect to profile creation
          navigate('/profile/create', { state: { redirectTo: '/apply' } });
        } else {
          setError('Failed to load profile data. Please try again.');
        }
      } finally {
        setIsLoading(false);
      }
    };
    
    loadProfile();
  }, [navigate, state]);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    setFormValues(prev => ({
      ...prev,
      [name]: type === 'number' 
        ? parseFloat(value) || 0
        : name === 'creditHistory'
          ? (e.target as HTMLInputElement).checked
          : value
    }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formValues.loanAmount <= 0) {
      setError('Please specify a valid loan amount');
      return;
    }
    
    setIsSubmitting(true);
    setError(null);
    setSuccess(null);
    
    try {
      // Map form values to API expected format using camelCase
      const loanData = {
        gender: formValues.gender,
        maritalStatus: formValues.maritalStatus,
        dependents: formValues.dependents,
        education: formValues.education,
        employmentStatus: formValues.employmentStatus,
        income: formValues.income,
        coApplicantIncome: formValues.coApplicantIncome,
        loanAmount: formValues.loanAmount,
        loanTerm: formValues.loanTerm,
        creditHistory: formValues.creditHistory,
        propertyArea: formValues.propertyArea
      };
      
      const response = await createLoanApplication(loanData);
      setSuccess('Loan application submitted successfully!');
      
      // Navigate to the loan details page after a short delay
      setTimeout(() => {
        navigate(`/loans/${response.data.id}`);
      }, 1500);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to submit loan application. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  if (isLoading || !profileLoaded) {
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
              Apply for a Loan
            </h3>
            <p className="mt-1 max-w-2xl text-sm text-blue-100">
              Fill in the form below to submit your loan application
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
          
          {/* Prediction Result Banner */}
          {predictionResult && (
            <div className={`m-4 p-4 rounded-md ${predictionResult.eligible ? 'bg-green-50' : 'bg-yellow-50'}`}>
              <div className="flex">
                <div className={`flex-shrink-0 ${predictionResult.eligible ? 'text-green-400' : 'text-yellow-400'}`}>
                  {predictionResult.eligible ? (
                    <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
                <div className="ml-3">
                  <h3 className={`text-sm font-medium ${predictionResult.eligible ? 'text-green-800' : 'text-yellow-800'}`}>
                    AI Eligibility Assessment: {predictionResult.eligible ? 'Eligible' : 'May not be eligible'}
                  </h3>
                  <div className={`mt-2 text-sm ${predictionResult.eligible ? 'text-green-700' : 'text-yellow-700'}`}>
                    <p>Confidence score: {(predictionResult.score * 100).toFixed(2)}%</p>
                    <p className="mt-1">{predictionResult.explanation}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
            <form onSubmit={handleSubmit} className="space-y-8 divide-y divide-gray-200">
              <div className="space-y-8 divide-y divide-gray-200">
                {/* Loan Details Section */}
                <div>
                  <div>
                    <h3 className="text-lg leading-6 font-medium text-gray-900">Loan Details</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Please specify the details of the loan you are applying for
                    </p>
                  </div>
                  
                  <div className="mt-6 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                    <div className="sm:col-span-3">
                      <label htmlFor="loanAmount" className="block text-sm font-medium text-gray-700">
                        Loan Amount
                      </label>
                      <div className="mt-1 relative rounded-md shadow-sm">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <span className="text-gray-500 sm:text-sm">$</span>
                        </div>
                        <input
                          type="number"
                          name="loanAmount"
                          id="loanAmount"
                          min="1"
                          value={formValues.loanAmount}
                          onChange={handleChange}
                          className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-7 sm:text-sm border-gray-300 rounded-md"
                          placeholder="0.00"
                          required
                        />
                      </div>
                    </div>
                    
                    <div className="sm:col-span-3">
                      <label htmlFor="loanTerm" className="block text-sm font-medium text-gray-700">
                        Loan Term (months)
                      </label>
                      <select
                        id="loanTerm"
                        name="loanTerm"
                        value={formValues.loanTerm}
                        onChange={handleChange}
                        className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        required
                      >
                        <option value={6}>6 months</option>
                        <option value={12}>12 months</option>
                        <option value={24}>24 months</option>
                        <option value={36}>36 months</option>
                        <option value={48}>48 months</option>
                        <option value={60}>60 months</option>
                      </select>
                    </div>
                  </div>
                </div>
                
                {/* Personal Information */}
                <div className="pt-8">
                  <div>
                    <h3 className="text-lg leading-6 font-medium text-gray-900">Personal Information</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      This information is pre-filled from your profile and is used to assess your loan eligibility
                    </p>
                  </div>
                  
                  <div className="mt-6 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                    <div className="sm:col-span-3">
                      <label htmlFor="gender" className="block text-sm font-medium text-gray-700">Gender</label>
                      <select
                        id="gender"
                        name="gender"
                        value={formValues.gender}
                        onChange={handleChange}
                        className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      >
                        <option value="MALE">Male</option>
                        <option value="FEMALE">Female</option>
                        <option value="OTHER">Other</option>
                      </select>
                    </div>

                    <div className="sm:col-span-3">
                      <label htmlFor="maritalStatus" className="block text-sm font-medium text-gray-700">Marital Status</label>
                      <select
                        id="maritalStatus"
                        name="maritalStatus"
                        value={formValues.maritalStatus}
                        onChange={handleChange}
                        className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      >
                        <option value="SINGLE">Single</option>
                        <option value="MARRIED">Married</option>
                        <option value="DIVORCED">Divorced</option>
                        <option value="WIDOWED">Widowed</option>
                      </select>
                    </div>

                    <div className="sm:col-span-3">
                      <label htmlFor="dependents" className="block text-sm font-medium text-gray-700">Number of Dependents</label>
                      <input
                        type="number"
                        name="dependents"
                        id="dependents"
                        min="0"
                        value={formValues.dependents}
                        onChange={handleChange}
                        className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                      />
                    </div>

                    <div className="sm:col-span-3">
                      <label htmlFor="education" className="block text-sm font-medium text-gray-700">Education</label>
                      <select
                        id="education"
                        name="education"
                        value={formValues.education}
                        onChange={handleChange}
                        className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      >
                        <option value="GRADUATE">Graduate</option>
                        <option value="NOT_GRADUATE">Not Graduate</option>
                      </select>
                    </div>

                    <div className="sm:col-span-3">
                      <label htmlFor="employmentStatus" className="block text-sm font-medium text-gray-700">Employment Status</label>
                      <select
                        id="employmentStatus"
                        name="employmentStatus"
                        value={formValues.employmentStatus}
                        onChange={handleChange}
                        className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      >
                        <option value="EMPLOYED">Employed</option>
                        <option value="SELF_EMPLOYED">Self-Employed</option>
                        <option value="UNEMPLOYED">Unemployed</option>
                        <option value="STUDENT">Student</option>
                      </select>
                    </div>

                    <div className="sm:col-span-3">
                      <label htmlFor="propertyArea" className="block text-sm font-medium text-gray-700">Property Area</label>
                      <select
                        id="propertyArea"
                        name="propertyArea"
                        value={formValues.propertyArea}
                        onChange={handleChange}
                        className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      >
                        <option value="URBAN">Urban</option>
                        <option value="SEMIURBAN">Semi-Urban</option>
                        <option value="RURAL">Rural</option>
                      </select>
                    </div>
                  </div>
                </div>
                
                {/* Financial Information */}
                <div className="pt-8">
                  <div>
                    <h3 className="text-lg leading-6 font-medium text-gray-900">Financial Information</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Your financial details will be used to determine your eligibility for the loan
                    </p>
                  </div>
                  
                  <div className="mt-6 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                    <div className="sm:col-span-3">
                      <label htmlFor="income" className="block text-sm font-medium text-gray-700">
                        Monthly Income
                      </label>
                      <div className="mt-1 relative rounded-md shadow-sm">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <span className="text-gray-500 sm:text-sm">$</span>
                        </div>
                        <input
                          type="number"
                          name="income"
                          id="income"
                          min="0"
                          value={formValues.income}
                          onChange={handleChange}
                          className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-7 sm:text-sm border-gray-300 rounded-md"
                          placeholder="0.00"
                        />
                      </div>
                    </div>

                    <div className="sm:col-span-3">
                      <label htmlFor="coApplicantIncome" className="block text-sm font-medium text-gray-700">
                        Co-Applicant Monthly Income
                      </label>
                      <div className="mt-1 relative rounded-md shadow-sm">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <span className="text-gray-500 sm:text-sm">$</span>
                        </div>
                        <input
                          type="number"
                          name="coApplicantIncome"
                          id="coApplicantIncome"
                          min="0"
                          value={formValues.coApplicantIncome}
                          onChange={handleChange}
                          className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-7 sm:text-sm border-gray-300 rounded-md"
                          placeholder="0.00"
                        />
                      </div>
                    </div>

                    <div className="sm:col-span-6">
                      <div className="flex items-start">
                        <div className="flex items-center h-5">
                          <input
                            id="creditHistory"
                            name="creditHistory"
                            type="checkbox"
                            checked={formValues.creditHistory}
                            onChange={(e) => setFormValues(prev => ({
                              ...prev,
                              creditHistory: e.target.checked
                            }))}
                            className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded"
                          />
                        </div>
                        <div className="ml-3 text-sm">
                          <label htmlFor="creditHistory" className="font-medium text-gray-700">Good Credit History</label>
                          <p className="text-gray-500">Do you have a good credit history?</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-5 pb-5">
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => navigate(-1)}
                    className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white ${isSubmitting ? 'bg-gray-400' : 'bg-indigo-600 hover:bg-indigo-700'} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`}
                  >
                    {isSubmitting ? 'Submitting...' : 'Submit Application'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApplyLoan;