import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../../context/DataContext';
import { useToast } from '../../context/toastContext';
import { Gender, MaritalStatus, Education, EmploymentStatus, PropertyArea } from '../../types/enums';

interface ProfileFormData {
  fullName: string;
  nationalId: string;
  gender: Gender;
  maritalStatus: MaritalStatus;
  dependents: number;
  education: Education;
  employmentStatus: EmploymentStatus;
  income: number;
  coApplicantIncome: number;
  creditHistory: boolean;
  bankTransactions: string;
  lendingHistory: string;
  loanPurpose: string;
  propertyArea: PropertyArea;
}

const CreateProfile: React.FC = () => {
  const navigate = useNavigate();
  const { createProfile, loading } = useData();
  const { showToast } = useToast();
  
  const [formData, setFormData] = useState<ProfileFormData>({
    fullName: '',
    nationalId: '',
    gender: Gender.MALE,
    maritalStatus: MaritalStatus.SINGLE,
    dependents: 0,
    education: Education.NOT_GRADUATE,
    employmentStatus: EmploymentStatus.EMPLOYED,
    income: 0,
    coApplicantIncome: 0,
    creditHistory: true,
    bankTransactions: 'NONE',
    lendingHistory: 'NONE',
    loanPurpose: 'OTHER',
    propertyArea: PropertyArea.URBAN
  });

  const isLoading = loading.createProfile;

  const handleInputChange = (field: keyof ProfileFormData, value: string | number | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await createProfile(formData);
      showToast('Profile created successfully!', 'success');
      navigate('/profile');
    } catch (error: any) {
      console.error('Failed to create profile:', error);
      if (Array.isArray(error.response?.data?.detail)) {
        showToast(`${error.response.data.detail[0].loc[1]} ${error.response.data.detail[0].msg}`, 'error');
      } else {
        showToast(error.response?.data?.detail || 'Failed to create profile', 'error');
      }
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
      <div className="bg-white shadow rounded-lg">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200">
          <h1 className="text-2xl font-bold text-gray-900">Create Profile</h1>
          <p className="text-gray-600 mt-1">
            Complete your profile to get started with credit scoring
          </p>
        </div>

        {/* Profile Form */}
        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Personal Information */}
            <div className="md:col-span-2">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h2>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Full Name *
              </label>
              <input
                type="text"
                value={formData.fullName}
                onChange={(e) => handleInputChange('fullName', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white text-gray-900 focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                National ID *
              </label>
              <input
                type="text"
                value={formData.nationalId}
                onChange={(e) => handleInputChange('nationalId', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white text-gray-900 focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Gender
              </label>
              <select
                value={formData.gender}
                onChange={(e) => handleInputChange('gender', e.target.value as Gender)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white text-gray-900 focus:ring-2 focus:ring-sky-500 focus:border-transparent"
              >
                <option value={Gender.MALE}>Male</option>
                <option value={Gender.FEMALE}>Female</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Marital Status
              </label>
              <select
                value={formData.maritalStatus}
                onChange={(e) => handleInputChange('maritalStatus', e.target.value as MaritalStatus)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white text-gray-900 focus:ring-2 focus:ring-sky-500 focus:border-transparent"
              >
                <option value={MaritalStatus.SINGLE}>Single</option>
                <option value={MaritalStatus.MARRIED}>Married</option>
                <option value={MaritalStatus.DIVORCED}>Divorced</option>
                <option value={MaritalStatus.WIDOWED}>Widowed</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Number of Dependents
              </label>
              <input
                type="number"
                min="0"
                value={formData.dependents}
                onChange={(e) => handleInputChange('dependents', parseInt(e.target.value) || 0)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white text-gray-900 focus:ring-2 focus:ring-sky-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Education
              </label>
              <select
                value={formData.education}
                onChange={(e) => handleInputChange('education', e.target.value as Education)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white text-gray-900 focus:ring-2 focus:ring-sky-500 focus:border-transparent"
              >
                <option value={Education.GRADUATE}>Graduate</option>
                <option value={Education.NOT_GRADUATE}>Not Graduate</option>
              </select>
            </div>

            {/* Financial Information */}
            <div className="md:col-span-2">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 mt-6">Financial Information</h2>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Employment Status
              </label>
              <select
                value={formData.employmentStatus}
                onChange={(e) => handleInputChange('employmentStatus', e.target.value as EmploymentStatus)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white text-gray-900 focus:ring-2 focus:ring-sky-500 focus:border-transparent"
              >
                <option value={EmploymentStatus.EMPLOYED}>Employed</option>
                <option value={EmploymentStatus.SELF_EMPLOYED}>Self Employed</option>
                <option value={EmploymentStatus.UNEMPLOYED}>Unemployed</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Monthly Income (XAF)
              </label>
              <input
                type="number"
                min="0"
                value={formData.income}
                onChange={(e) => handleInputChange('income', parseFloat(e.target.value) || 0)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white text-gray-900 focus:ring-2 focus:ring-sky-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Co-Applicant Income (XAF)
              </label>
              <input
                type="number"
                min="0"
                value={formData.coApplicantIncome}
                onChange={(e) => handleInputChange('coApplicantIncome', parseFloat(e.target.value) || 0)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white text-gray-900 focus:ring-2 focus:ring-sky-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Property Area
              </label>
              <select
                value={formData.propertyArea}
                onChange={(e) => handleInputChange('propertyArea', e.target.value as PropertyArea)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white text-gray-900 focus:ring-2 focus:ring-sky-500 focus:border-transparent"
              >
                <option value={PropertyArea.URBAN}>Urban</option>
                <option value={PropertyArea.SEMIURBAN}>Semi-urban</option>
                <option value={PropertyArea.RURAL}>Rural</option>
              </select>
            </div>

            {/* Credit History Assessment */}
            <div className="md:col-span-2">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 mt-6">Credit History Assessment</h2>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Bank Transactions
              </label>
              <select
                value={formData.bankTransactions}
                onChange={(e) => handleInputChange('bankTransactions', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white text-gray-900 focus:ring-2 focus:ring-sky-500 focus:border-transparent"
              >
                <option value="NONE">None</option>
                <option value="LESS_THAN_5">Less than 5</option>
                <option value="OVER_5">Over 5</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Lending History
              </label>
              <select
                value={formData.lendingHistory}
                onChange={(e) => handleInputChange('lendingHistory', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white text-gray-900 focus:ring-2 focus:ring-sky-500 focus:border-transparent"
              >
                <option value="NONE">None</option>
                <option value="LESS_THAN_5">Less than 5</option>
                <option value="OVER_5">Over 5</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Loan Purpose
              </label>
              <select
                value={formData.loanPurpose}
                onChange={(e) => handleInputChange('loanPurpose', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white text-gray-900 focus:ring-2 focus:ring-sky-500 focus:border-transparent"
              >
                <option value="BUSINESS_INVESTMENT">Business Investment</option>
                <option value="RENTS_AND_BILLS">Rents and Bills</option>
                <option value="CAR_PURCHASE">Car Purchase</option>
                <option value="BUILDING_PURCHASE">Building/Property Purchase</option>
                <option value="EDUCATION">Education</option>
                <option value="MEDICAL_EMERGENCY">Medical Emergency</option>
                <option value="OTHER">Other</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={formData.creditHistory}
                  onChange={(e) => handleInputChange('creditHistory', e.target.checked)}
                  className="rounded border-gray-300 text-sky-600 focus:ring-sky-500"
                />
                <span className="text-sm font-medium text-gray-700">
                  Good Credit History (Automatically Calculated)
                </span>
              </label>
              <p className="text-xs text-gray-500 mt-1 ml-6">
                This value is calculated automatically based on your banking behavior and loan patterns
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-4 mt-8">
            <button
              type="submit"
              disabled={isLoading}
              className="bg-gradient-to-r from-sky-500 to-teal-500 text-white px-6 py-2 rounded-lg font-medium hover:from-sky-600 hover:to-teal-600 disabled:opacity-50 transition-all duration-200"
            >
              {isLoading ? 'Creating...' : 'Create Profile'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/profile')}
              className="border border-gray-300 text-gray-700 px-6 py-2 rounded-lg font-medium hover:bg-gray-50 transition-colors duration-200"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateProfile;