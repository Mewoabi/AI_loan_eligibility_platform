import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';

// Types for profile form values
type ProfileFormValues = {
  fullName: string;
  nationalId: string;
  gender: string;
  maritalStatus: string;
  dependents: number;
  education: string;
  employmentStatus: string;
  income: number;
  coApplicantIncome: number;
  creditHistory: boolean;
  bankTransactions: string;
  lendingHistory: string;
  loanPurpose: string;
  propertyArea: string;
};

const ProfilePage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { profile, loading, error, updateProfile } = useData();
  const [isSaving, setIsSaving] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [editMode, setEditMode] = useState(false);
  
  // Profile form state
  const [profileForm, setProfileForm] = useState<ProfileFormValues>({
    fullName: '',
    nationalId: '',
    gender: 'MALE',
    maritalStatus: 'SINGLE',
    dependents: 0,
    education: 'GRADUATE',
    employmentStatus: 'EMPLOYED',
    income: 0,
    coApplicantIncome: 0,
    creditHistory: true,
    bankTransactions: 'NONE',
    lendingHistory: 'NONE',
    loanPurpose: 'OTHER',
    propertyArea: 'URBAN'
  });
  
  const isLoading = loading.profile;
  const errorMessage = error.profile;
  
  // Load user profile data on component mount
  useEffect(() => {
    if (profile) {
      // Map API response to form values - now using camelCase
      setProfileForm({
        fullName: profile.fullName || '',
        nationalId: profile.nationalId || '',
        gender: profile.gender || 'MALE',
        maritalStatus: profile.maritalStatus || 'SINGLE',
        dependents: profile.dependents || 0,
        education: profile.education || 'GRADUATE',
        employmentStatus: profile.employmentStatus || 'EMPLOYED',
        income: profile.income || 0,
        coApplicantIncome: profile.coApplicantIncome || 0,
        creditHistory: profile.creditHistory ?? true,
        bankTransactions: profile.bankTransactions || 'NONE',
        lendingHistory: profile.lendingHistory || 'NONE',
        loanPurpose: profile.loanPurpose || 'OTHER',
        propertyArea: profile.propertyArea || 'URBAN'
      });
    } else if (errorMessage && errorMessage.includes('404')) {
      // Profile doesn't exist, redirect to profile creation
      navigate('/profile/create');
    }
  }, [profile, errorMessage, navigate]);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    setProfileForm((prev: ProfileFormValues) => ({
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
    setSuccess(null);
    setIsSaving(true);
    
    try {
      await updateProfile(profileForm);
      setSuccess('Profile updated successfully!');
      
      // Clear success message after a delay
      setTimeout(() => {
        setSuccess(null);
      }, 3000);
    } catch (err: any) {
      // Error is handled by the DataContext
      console.error('Failed to update profile:', err);
    } finally {
      setIsSaving(false);
    }
  };
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-gradient-to-br from-sky-50 to-blue-100 dark:from-gray-900 dark:to-gray-800 transition-colors duration-300">
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-8 shadow-xl transition-colors duration-300">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-sky-500 mx-auto"></div>
          <p className="text-sky-700 dark:text-sky-300 mt-4 text-center font-medium transition-colors duration-300">Loading your profile...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 to-blue-100 dark:from-gray-900 dark:to-gray-800 py-8 transition-colors duration-300">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-sky-500 to-blue-600 rounded-2xl shadow-lg mb-4">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 transition-colors duration-300">Your Profile</h1>
          <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto transition-colors duration-300">
            Manage your personal and financial information for accurate loan eligibility assessments
          </p>
        </div>

        {/* Main Form Card */}
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-3xl shadow-2xl overflow-hidden border border-white/20 dark:border-gray-700/20 transition-colors duration-300">
          {/* Success/Error Messages */}
          {errorMessage && (
            <div className="mx-6 mt-6 rounded-xl bg-red-50 dark:bg-red-900/50 border border-red-200 dark:border-red-800 p-4 transition-colors duration-300">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400 dark:text-red-300" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800 dark:text-red-200 transition-colors duration-300">{errorMessage}</h3>
                </div>
              </div>
            </div>
          )}
          
          {success && (
            <div className="mx-6 mt-6 rounded-xl bg-green-50 dark:bg-green-900/50 border border-green-200 dark:border-green-800 p-4 transition-colors duration-300">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-green-400 dark:text-green-300" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-green-800 dark:text-green-200 transition-colors duration-300">{success}</h3>
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="p-6 space-y-8">
            {/* Basic Information Section */}
            <div className="space-y-6">
              <div className="border-b border-gray-200 dark:border-gray-600 pb-4 transition-colors duration-300">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center transition-colors duration-300">
                  <div className="w-8 h-8 bg-sky-100 dark:bg-sky-900/50 rounded-lg flex items-center justify-center mr-3 transition-colors duration-300">
                    <svg className="w-4 h-4 text-sky-600 dark:text-sky-400 transition-colors duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V4a2 2 0 114 0v2m-4 0a2 2 0 104 0m-4 0v2m0 0h4" />
                    </svg>
                  </div>
                  Basic Information
                </h2>
                <p className="text-gray-600 dark:text-gray-300 mt-2 ml-11 transition-colors duration-300">Your personal identification details</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="full_name" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-300">
                    Full Name
                  </label>
                {editMode ?   <input
                    type="text"
                    name="fullName"
                    id="full_name"
                    value={profileForm.fullName}
                    onChange={handleChange}
                    className="w-full h-12 px-4 border border-gray-300 dark:border-gray-600 rounded-xl shadow-sm focus:ring-2 focus:ring-sky-500 focus:border-sky-500 bg-white/70 dark:bg-gray-700/70 backdrop-blur-sm text-gray-900 dark:text-white transition-all duration-200"
                    placeholder="Enter your full name"
                  /> : 
                  <p className="w-full py-2 px-4 border border-gray-300 dark:border-gray-600 rounded-xl shadow-sm focus:ring-2 hover:ring-sky-500 hover:border-sky-500 bg-white/70 dark:bg-gray-700/70 backdrop-blur-sm text-gray-900 dark:text-white transition-all duration-200">{profile?.fullName}</p>
                  }
                </div>

                <div>
                  <label htmlFor="national_id" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-300">
                    National ID
                  </label>
                 {editMode ? <input
                    type="text"
                    name="nationalId"
                    id="national_id"
                    value={profile?.nationalId}
                    onChange={handleChange}
                    className="w-full h-12 px-4 border border-gray-300 dark:border-gray-600 rounded-xl shadow-sm focus:ring-2 focus:ring-sky-500 focus:border-sky-500 bg-white/70 dark:bg-gray-700/70 backdrop-blur-sm text-gray-900 dark:text-white transition-all duration-200"
                    placeholder="Enter your national ID"
                  />: 
                   <p className="w-full py-2 px-4 border border-gray-300 dark:border-gray-600 rounded-xl shadow-sm focus:ring-2 hover:ring-sky-500 hover:border-sky-500 bg-white/70 dark:bg-gray-700/70 backdrop-blur-sm text-gray-900 dark:text-white transition-all duration-200">{profile?.nationalId}</p>
                  }
                </div>
                
                <div>
                  <label htmlFor="gender" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-300">
                    Gender
                  </label>
                 {editMode ? <select
                    id="gender"
                    name="gender"
                    value={profile?.gender}
                    onChange={handleChange}
                    className="w-full h-12 px-4 border border-gray-300 dark:border-gray-600 rounded-xl shadow-sm focus:ring-2 focus:ring-sky-500 focus:border-sky-500 bg-white/70 dark:bg-gray-700/70 backdrop-blur-sm text-gray-900 dark:text-white transition-all duration-200"
                  >
                    <option value="MALE">Male</option>
                    <option value="FEMALE">Female</option>
                    <option value="OTHER">Other</option>
                  </select> : 
                   <p className="w-full py-2 px-4 border border-gray-300 dark:border-gray-600 rounded-xl shadow-sm focus:ring-2 hover:ring-sky-500 hover:border-sky-500 bg-white/70 dark:bg-gray-700/70 backdrop-blur-sm text-gray-900 dark:text-white transition-all duration-200">{profile?.gender}</p>
                  }
                </div>

                <div>
                  <label htmlFor="marital_status" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-300">
                    Marital Status
                  </label>
                {editMode ?  <select
                    id="marital_status"
                    name="maritalStatus"
                    value={profile?.maritalStatus}
                    onChange={handleChange}
                    className="w-full h-12 px-4 border border-gray-300 dark:border-gray-600 rounded-xl shadow-sm focus:ring-2 focus:ring-sky-500 focus:border-sky-500 bg-white/70 dark:bg-gray-700/70 backdrop-blur-sm text-gray-900 dark:text-white transition-all duration-200"
                  >
                    <option value="SINGLE">Single</option>
                    <option value="MARRIED">Married</option>
                    <option value="DIVORCED">Divorced</option>
                    <option value="WIDOWED">Widowed</option>
                  </select>: 
                   <p className="w-full py-2 px-4 border border-gray-300 dark:border-gray-600 rounded-xl shadow-sm focus:ring-2 hover:ring-sky-500 hover:border-sky-500 bg-white/70 dark:bg-gray-700/70 backdrop-blur-sm text-gray-900 dark:text-white transition-all duration-200">{profile?.maritalStatus}</p>
                  }
                </div>

                <div>
                  <label htmlFor="dependents" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-300">
                    Number of Dependents
                  </label>
                 {editMode ? <input
                    type="number"
                    name="dependents"
                    id="dependents"
                    min="0"
                    value={profile?.dependents}
                    onChange={handleChange}
                    className="w-full h-12 px-4 border border-gray-300 dark:border-gray-600 rounded-xl shadow-sm focus:ring-2 focus:ring-sky-500 focus:border-sky-500 bg-white/70 dark:bg-gray-700/70 backdrop-blur-sm text-gray-900 dark:text-white transition-all duration-200"
                    placeholder="0"
                  /> : 
                   <p className="w-full py-2 px-4 border border-gray-300 dark:border-gray-600 rounded-xl shadow-sm focus:ring-2 hover:ring-sky-500 hover:border-sky-500 bg-white/70 dark:bg-gray-700/70 backdrop-blur-sm text-gray-900 dark:text-white transition-all duration-200">{profile?.dependents}</p>
                  }
                </div>

                <div>
                  <label htmlFor="education" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-300">
                    Education Level
                  </label>
                  {editMode ? <select
                    id="education"
                    name="education"
                    value={profile?.education}
                    onChange={handleChange}
                    className="w-full h-12 px-4 border border-gray-300 dark:border-gray-600 rounded-xl shadow-sm focus:ring-2 focus:ring-sky-500 focus:border-sky-500 bg-white/70 dark:bg-gray-700/70 backdrop-blur-sm text-gray-900 dark:text-white transition-all duration-200"
                  >
                    <option value="GRADUATE">Graduate</option>
                    <option value="NOT_GRADUATE">Not Graduate</option>
                  </select> : 
                   <p className="w-full py-2 px-4 border border-gray-300 dark:border-gray-600 rounded-xl shadow-sm focus:ring-2 hover:ring-sky-500 hover:border-sky-500 bg-white/70 dark:bg-gray-700/70 backdrop-blur-sm text-gray-900 dark:text-white transition-all duration-200">{profile?.education}</p>
                  }
                </div>
              </div>
            </div>
            
            {/* Financial Information Section */}
            <div className="space-y-6">
              <div className="border-b border-gray-200 dark:border-gray-600 pb-4 transition-colors duration-300">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center transition-colors duration-300">
                  <div className="w-8 h-8 bg-green-100 dark:bg-green-900/50 rounded-lg flex items-center justify-center mr-3 transition-colors duration-300">
                    <svg className="w-4 h-4 text-green-600 dark:text-green-400 transition-colors duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                    </svg>
                  </div>
                  Financial Information
                </h2>
                <p className="text-gray-600 dark:text-gray-300 mt-2 ml-11 transition-colors duration-300">Your employment and income details</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="employment_status" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-300">
                    Employment Status
                  </label>
                 {editMode ? <select
                    id="employment_status"
                    name="employmentStatus"
                    value={profile?.employmentStatus}
                    onChange={handleChange}
                    className="w-full h-12 px-4 border border-gray-300 dark:border-gray-600 rounded-xl shadow-sm focus:ring-2 focus:ring-sky-500 focus:border-sky-500 bg-white/70 dark:bg-gray-700/70 backdrop-blur-sm text-gray-900 dark:text-white transition-all duration-200"
                  >
                    <option value="EMPLOYED">Employed</option>
                    <option value="SELF_EMPLOYED">Self-Employed</option>
                    <option value="UNEMPLOYED">Unemployed</option>
                    <option value="STUDENT">Student</option>
                  </select> : 
                   <p className="w-full py-2 px-4 border border-gray-300 dark:border-gray-600 rounded-xl shadow-sm focus:ring-2 hover:ring-sky-500 hover:border-sky-500 bg-white/70 dark:bg-gray-700/70 backdrop-blur-sm text-gray-900 dark:text-white transition-all duration-200">{profile?.employmentStatus}</p>
                  }
                </div>

                <div>
                  <label htmlFor="income" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-300">
                    Monthly Income
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <span className="text-gray-500 dark:text-gray-400 text-sm font-medium transition-colors duration-300">$</span>
                    </div>
                    {editMode ? <input
                      type="number"
                      name="income"
                      id="income"
                      min="0"
                      value={profile?.income}
                      onChange={handleChange}
                      className="w-full h-12 pl-8 pr-4 border border-gray-300 dark:border-gray-600 rounded-xl shadow-sm focus:ring-2 focus:ring-sky-500 focus:border-sky-500 bg-white/70 dark:bg-gray-700/70 backdrop-blur-sm text-gray-900 dark:text-white transition-all duration-200"
                      placeholder="0.00"
                    /> : <p className="w-full py-2 px-4 border border-gray-300 dark:border-gray-600 rounded-xl shadow-sm focus:ring-2 hover:ring-sky-500 hover:border-sky-500 bg-white/70 dark:bg-gray-700/70 backdrop-blur-sm text-gray-900 dark:text-white transition-all duration-200">{profile?.income}</p>}
                  </div>
                </div>
                
                <div>
                  <label htmlFor="co_applicant_income" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-300">
                    Co-Applicant Income
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <span className="text-gray-500 dark:text-gray-400 text-sm font-medium transition-colors duration-300">$</span>
                    </div>
                  {editMode ?  <input
                      type="number"
                      name="coApplicantIncome"
                      id="co_applicant_income"
                      min="0"
                      value={profile?.coApplicantIncome}
                      onChange={handleChange}
                      className="w-full h-12 pl-8 pr-4 border border-gray-300 dark:border-gray-600 rounded-xl shadow-sm focus:ring-2 focus:ring-sky-500 focus:border-sky-500 bg-white/70 dark:bg-gray-700/70 backdrop-blur-sm text-gray-900 dark:text-white transition-all duration-200"
                      placeholder="0.00"
                      /> : <p className="w-full py-2 px-4 border border-gray-300 dark:border-gray-600 rounded-xl shadow-sm focus:ring-2 hover:ring-sky-500 hover:border-sky-500 bg-white/70 dark:bg-gray-700/70 backdrop-blur-sm text-gray-900 dark:text-white transition-all duration-200">{profile?.coApplicantIncome}</p>}
                  </div>
                </div>
                
                <div>
                  <label htmlFor="property_area" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-300">
                    Property Area
                  </label>
                 {editMode ? <select
                    id="property_area"
                    name="propertyArea"
                    value={profile?.propertyArea}
                    onChange={handleChange}
                    className="w-full h-12 px-4 border border-gray-300 dark:border-gray-600 rounded-xl shadow-sm focus:ring-2 focus:ring-sky-500 focus:border-sky-500 bg-white/70 dark:bg-gray-700/70 backdrop-blur-sm text-gray-900 dark:text-white transition-all duration-200"
                  >
                    <option value="URBAN">Urban</option>
                    <option value="SEMIURBAN">Semi-Urban</option>
                    <option value="RURAL">Rural</option>
                  </select> : <p className="w-full py-2 px-4 border border-gray-300 dark:border-gray-600 rounded-xl shadow-sm focus:ring-2 hover:ring-sky-500 hover:border-sky-500 bg-white/70 dark:bg-gray-700/70 backdrop-blur-sm text-gray-900 dark:text-white transition-all duration-200">{profile?.propertyArea}</p>}
                </div>
              </div>
            </div>

            {/* Credit History Assessment Section */}
            <div className="space-y-6">
              <div className="border-b border-gray-200 dark:border-gray-600 pb-4 transition-colors duration-300">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center transition-colors duration-300">
                  <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/50 rounded-lg flex items-center justify-center mr-3 transition-colors duration-300">
                    <svg className="w-4 h-4 text-purple-600 dark:text-purple-400 transition-colors duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                  Credit History Assessment
                </h2>
                <p className="text-gray-600 dark:text-gray-300 mt-2 ml-11 transition-colors duration-300">
                  Help us assess your creditworthiness based on your banking behavior and financial patterns
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="bank_transactions" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-300">
                    How many bank transactions have you been involved in?
                  </label>
                 {editMode ? <select
                    id="bank_transactions"
                    name="bankTransactions"
                    value={profile?.bankTransactions}
                    onChange={handleChange}
                    className="w-full h-12 px-4 border border-gray-300 dark:border-gray-600 rounded-xl shadow-sm focus:ring-2 focus:ring-sky-500 focus:border-sky-500 bg-white/70 dark:bg-gray-700/70 backdrop-blur-sm text-gray-900 dark:text-white transition-all duration-200"
                    required
                  >
                    <option value="NONE">None</option>
                    <option value="LESS_THAN_5">Less than 5</option>
                    <option value="OVER_5">Over 5</option>
                  </select> : 
                   <p className="w-full py-2 px-4 border border-gray-300 dark:border-gray-600 rounded-xl shadow-sm focus:ring-2 hover:ring-sky-500 hover:border-sky-500 bg-white/70 dark:bg-gray-700/70 backdrop-blur-sm text-gray-900 dark:text-white transition-all duration-200">{profile?.bankTransactions}</p>
                  }
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 transition-colors duration-300">
                    Including deposits, withdrawals, transfers, etc.
                  </p>
                </div>

                <div>
                  <label htmlFor="lending_history" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-300">
                    How many times have you borrowed money?
                  </label>
                 {editMode ? <select
                    id="lending_history"
                    name="lendingHistory"
                    value={profile?.lendingHistory}
                    onChange={handleChange}
                    className="w-full h-12 px-4 border border-gray-300 dark:border-gray-600 rounded-xl shadow-sm focus:ring-2 focus:ring-sky-500 focus:border-sky-500 bg-white/70 dark:bg-gray-700/70 backdrop-blur-sm text-gray-900 dark:text-white transition-all duration-200"
                    required
                  >
                    <option value="NONE">None</option>
                    <option value="LESS_THAN_5">Less than 5</option>
                    <option value="OVER_5">Over 5</option>
                  </select> : 
                  <p className="w-full py-2 px-4 border border-gray-300 dark:border-gray-600 rounded-xl shadow-sm focus:ring-2 hover:ring-sky-500 hover:border-sky-500 bg-white/70 dark:bg-gray-700/70 backdrop-blur-sm text-gray-900 dark:text-white transition-all duration-200">{profile?.lendingHistory}</p>
                  }
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 transition-colors duration-300">
                    From banks, friends, family, or institutions
                  </p>
                </div>

                <div className="md:col-span-2">
                  <label htmlFor="loan_purpose" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-300">
                    What is your most frequent cause of loans?
                  </label>
                  {editMode ? <select
                    id="loan_purpose"
                    name="loanPurpose"
                    value={profile?.loanPurpose}
                    onChange={handleChange}
                    className="w-full h-12 px-4 border border-gray-300 dark:border-gray-600 rounded-xl shadow-sm focus:ring-2 focus:ring-sky-500 focus:border-sky-500 bg-white/70 dark:bg-gray-700/70 backdrop-blur-sm text-gray-900 dark:text-white transition-all duration-200"
                    required
                  >
                    <option value="BUSINESS_INVESTMENT">Business Investment</option>
                    <option value="RENTS_AND_BILLS">Rents and Bills</option>
                    <option value="CAR_PURCHASE">Car Purchase</option>
                    <option value="BUILDING_PURCHASE">Building/Property Purchase</option>
                    <option value="EDUCATION">Education</option>
                    <option value="MEDICAL_EMERGENCY">Medical Emergency</option>
                    <option value="OTHER">Other</option>
                  </select> : 
                   <p className="w-full py-2 px-4 border border-gray-300 dark:border-gray-600 rounded-xl shadow-sm focus:ring-2 hover:ring-sky-500 hover:border-sky-500 bg-white/70 dark:bg-gray-700/70 backdrop-blur-sm text-gray-900 dark:text-white transition-all duration-200">{profile?.loanPurpose}</p>
                  }
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 transition-colors duration-300">
                    This helps us understand your financial priorities and risk profile
                  </p>
                </div>
              </div>

              {/* Credit History Status Display */}
              <div className="bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/30 dark:to-indigo-900/30 rounded-xl p-4 border border-purple-200 dark:border-purple-800 transition-colors duration-300">
                <div className="flex items-start">
                  <div className="flex items-center h-5 mt-1">
                    <svg className="h-5 w-5 text-purple-600 dark:text-purple-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="font-semibold text-purple-900 dark:text-purple-200 transition-colors duration-300">
                      Credit History Assessment
                    </h3>
                    <p className="text-purple-700 dark:text-purple-300 text-sm mt-1 transition-colors duration-300">
                      Your credit history will be automatically assessed based on your banking behavior and loan patterns. This replaces the manual checkbox to ensure more accurate credit evaluation.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200 dark:border-gray-600 transition-colors duration-300">
             {editMode ?  <button
                type="button"
                onClick={() => setEditMode(false)}
                className="px-6 py-3 border border-gray-300 dark:border-gray-600 rounded-xl text-gray-700 dark:text-gray-300 font-medium bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 dark:ring-offset-gray-800 transition-all duration-200"
              >
                Cancel
              </button> : 
               <button
                type="button"
                onClick={() => setEditMode(true)}
                className="px-6 py-3 border border-gray-300 dark:border-gray-600 rounded-xl text-gray-700 dark:text-gray-300 font-medium bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 dark:ring-offset-gray-800 transition-all duration-200"
              >
                Edit Profile
              </button>
              }
             {editMode &&  <button
                type="submit"
                disabled={isSaving}
                className={`px-8 py-3 rounded-xl font-semibold text-white shadow-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 dark:ring-offset-gray-800 ${
                  isSaving 
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 transform hover:scale-105'
                }`}
              >
                {isSaving ? (
                  <div className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Updating Profile...
                  </div>
                ) : (
                  'Update Profile'
                )}
              </button>}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;