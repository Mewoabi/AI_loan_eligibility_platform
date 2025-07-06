import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { performCreditScore } from '../../services/api';
import Footer from '../../components/Footer';
import type { LoanPredictionResult } from './ScoreUser';
import { useToast } from '../../context/toastContext';

interface ScoreData {
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
  bankTransactions: string;
  lendingHistory: string;
  loanPurpose: string;
  propertyArea: string;
}

const QuickScore: React.FC = () => {
  const [scoreData, setScoreData] = useState<ScoreData>({
    gender: 'Male',
    maritalStatus: 'Married',
    dependents: 0,
    education: 'Graduate',
    employmentStatus: 'Employed',
    income: 0,
    coApplicantIncome: 0,
    loanAmount: 0,
    loanTerm: 12,
    creditHistory: true,
    propertyArea: 'Urban',
    bankTransactions: 'NONE',
    lendingHistory: 'NONE',
    loanPurpose: 'OTHER'
  });
  const { showToast } = useToast()
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  // console.log(scoreData)

  const handleInputChange = (field: keyof ScoreData, value: string | number | boolean) => {
    setScoreData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const processScoringData = (scoreData: ScoreData) => {
    return {
      gender: scoreData.gender.toUpperCase(),
      maritalStatus: scoreData.maritalStatus.toUpperCase().replace(' ', '_'),
      dependents: scoreData.dependents,
      education: scoreData.education.toUpperCase().replace(' ', '_'),
      employmentStatus: scoreData.employmentStatus.toUpperCase().replace(' ', '_'),
      income: scoreData.income,
      coApplicantIncome: scoreData.coApplicantIncome,
      loanAmount: scoreData.loanAmount / 1000, // Convert to thousands for scoring
      loanTerm: scoreData.loanTerm,
      creditHistory: scoreData.creditHistory,
      propertyArea: scoreData.propertyArea.toUpperCase(),
      bankTransactions: scoreData.bankTransactions.toUpperCase().replace('-', '_'),
      lendingHistory: scoreData.lendingHistory.toUpperCase().replace('-', '_'),
      loanPurpose: scoreData.loanPurpose.toUpperCase().replace('-', '_')
    };
  }

  function processScoreResult(scoreResult: LoanPredictionResult) {
    let explanation = "";
    let eligibilityPercentage = scoreResult.eligibilityPercentage;
    let eligible = scoreResult.eligible;
    let maxEligibleAmount = Math.ceil(scoreResult.maxEligibleAmount * 100000)
    let originalScore = scoreResult.originalScore;
    let requestedAmount = Math.ceil(scoreResult.requestedAmount * 100000)

    if (scoreResult.maxEligibleAmount >= scoreResult.requestedAmount) {
      if (scoreResult.maxEligibleAmount > scoreResult.requestedAmount) {
        explanation = `Congratulations! You are eligible for the requested loan of XAF ${(requestedAmount).toLocaleString()}. You are also eligible for loans up to XAF ${(maxEligibleAmount).toLocaleString()}.`;
      } else {
        explanation = `Congratulations! You are eligible for the requested loan of XAF ${(requestedAmount).toLocaleString()}.`;
      }
    } else if (scoreResult.maxEligibleAmount > 0) {
      explanation = `You are ${scoreResult.eligibilityPercentage}% eligible for the requested loan of XAF ${(requestedAmount).toLocaleString()}. However, you are 100% eligible for loans up to XAF ${(maxEligibleAmount).toLocaleString()}.`;
    } else {
      explanation = `Unfortunately, you are not eligible for the requested loan of XAF ${(requestedAmount).toLocaleString()} based on the current criteria. Please consider improving your financial profile or applying for a smaller amount.`;
    }
    return {
      explanation,
      eligible,
      originalScore,
      eligibilityPercentage,
      maxEligibleAmount,
      requestedAmount,
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const transformedData = processScoringData(scoreData)

    // Handle special case for "Semi-urban" -> "SEMIURBAN"
    if (transformedData.propertyArea === 'SEMI-URBAN') {
      transformedData.propertyArea = 'SEMIURBAN';
    }
    console.log('Transformed scoreData:', transformedData);
    console.log('currency transformed data', {
      ...transformedData,
      loanAmount: transformedData.loanAmount / 100,
      coApplicantIncome: transformedData.coApplicantIncome / 100,
      income: transformedData.income / 100,
      loanTerm: (transformedData.loanTerm / 12) * 360
      // loanTerm: (transformedData.loanTerm)
    })

    const currencyTransformedData = {
      ...transformedData,
      loanAmount: transformedData.loanAmount / 100,
      coApplicantIncome: transformedData.coApplicantIncome / 100,
      income: transformedData.income / 100,
      loanTerm: (transformedData.loanTerm / 12) * 360
      // loanTerm: (transformedData.loanTerm)
    }

    try {
      const response = await performCreditScore(currencyTransformedData);
      console.log("here is the response of the scoring", response.data)
      // const { requestedAmount, maxEligibleAmount, eligibilityPercentage } = response.data
      const result: LoanPredictionResult = processScoreResult(response.data as LoanPredictionResult)
      console.log(result)
      setResult(result);
    } catch (error: any) {
      console.error('Scoring failed:', error);
      // showToast('Failed to perform scoring. Please check your inputs and try again.', 'error');
      if (Array.isArray(error.response.data.detail)) {
        showToast(`${error.response.data.detail[0].loc[1]} ${error.response.data.detail[0].msg}`, 'error');
      } else {
        if (error.response.data.detail && typeof error.response.data.detail === 'string') showToast(error.response.data.detail)
      }
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setScoreData({
      gender: '',
      maritalStatus: '',
      dependents: 0,
      education: '',
      employmentStatus: '',
      income: 0,
      coApplicantIncome: 0,
      loanAmount: 0,
      loanTerm: 12,
      creditHistory: true,
      propertyArea: '',
      bankTransactions: '',
      lendingHistory: '',
      loanPurpose: ''
    });
    setResult(null);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-sky-50 dark:from-gray-900 dark:to-gray-800 transition-colors duration-300">
      <div className="max-w-4xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 transition-colors duration-300">
            Quick Credit Score
          </h1>
          <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto transition-colors duration-300">
            Get an instant credit score assessment. This is a quick evaluation that won't be saved to your account.
          </p>
          <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-lg transition-colors duration-300">
            <p className="text-blue-800 dark:text-blue-200 text-sm transition-colors duration-300">
              💡 <strong>Want to track your scores?</strong>
              <Link to="/register" className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium ml-1 transition-colors duration-300">
                Create an account
              </Link> to save results and build your credit history.
            </p>
          </div>
        </div>

        {!result ? (
          <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6 transition-colors duration-300">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Personal Information */}
                <div className="md:col-span-2">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 pb-2 border-b border-gray-200 dark:border-gray-600 transition-colors duration-300">
                    Personal Information
                  </h3>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-300">Gender</label>
                  <select
                    value={scoreData.gender}
                    onChange={(e) => handleInputChange('gender', e.target.value)}
                    className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-colors duration-300"
                    required
                  >
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-300">Marital Status</label>
                  <select
                    value={scoreData.maritalStatus}
                    onChange={(e) => handleInputChange('maritalStatus', e.target.value)}
                    className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-colors duration-300"
                    required
                  >
                    <option value="">Select Status</option>
                    <option value="Single">Single</option>
                    <option value="Married">Married</option>
                    <option value="Divorced">Divorced</option>
                    <option value="Widowed">Widowed</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-300">Number of Dependents</label>
                  <input
                    type="number"
                    min="0"
                    max="10"
                    value={scoreData.dependents}
                    onChange={(e) => handleInputChange('dependents', parseInt(e.target.value) || 0)}
                    className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-colors duration-300"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-300">Education Level</label>
                  <select
                    value={scoreData.education}
                    onChange={(e) => handleInputChange('education', e.target.value)}
                    className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-colors duration-300"
                    required
                  >
                    <option value="">Select Education</option>
                    <option value="Graduate">Graduate</option>
                    <option value="Not Graduate">Not Graduate</option>
                  </select>
                </div>

                {/* Financial Information */}
                <div className="md:col-span-2 mt-8">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 pb-2 border-b border-gray-200 dark:border-gray-600 transition-colors duration-300">
                    Financial Information
                  </h3>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-300">Employment Status</label>
                  <select
                    value={scoreData.employmentStatus}
                    onChange={(e) => handleInputChange('employmentStatus', e.target.value)}
                    className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-colors duration-300"
                    required
                  >
                    <option value="">Select Employment</option>
                    <option value="Employed">Employed</option>
                    <option value="Self Employed">Self Employed</option>
                    <option value="Unemployed">Unemployed</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-300">Monthly Income (XAF)</label>
                  <input
                    type="number"
                    min="0"
                    step="100"
                    value={scoreData.income}
                    onChange={(e) => handleInputChange('income', parseFloat(e.target.value) || 0)}
                    className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-colors duration-300"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-300">Co-Applicant Income (XAF)</label>
                  <input
                    type="number"
                    min="0"
                    step="100"
                    value={scoreData.coApplicantIncome}
                    onChange={(e) => handleInputChange('coApplicantIncome', parseFloat(e.target.value) || 0)}
                    className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-colors duration-300"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 transition-colors duration-300">Leave as 0 if no co-applicant</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-300">Property Area</label>
                  <select
                    value={scoreData.propertyArea}
                    onChange={(e) => handleInputChange('propertyArea', e.target.value)}
                    className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-colors duration-300"
                    required
                  >
                    <option value="">Select Area</option>
                    <option value="Urban">Urban</option>
                    <option value="Semiurban">Semi-urban</option>
                    <option value="Rural">Rural</option>
                  </select>
                </div>

                {/* Loan Information */}
                <div className="md:col-span-2 mt-8">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 pb-2 border-b border-gray-200 dark:border-gray-600 transition-colors duration-300">
                    Loan Information
                  </h3>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-300">Requested Loan Amount (XAF)</label>
                  <input
                    type="number"
                    min="100"
                    step="100"
                    value={scoreData.loanAmount}
                    onChange={(e) => handleInputChange('loanAmount', parseFloat(e.target.value) || 0)}
                    className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-colors duration-300"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-300">Loan Term (months)</label>
                  {/* <select
                    value={scoreData.loanTerm}
                    onChange={(e) => handleInputChange('loanTerm', parseInt(e.target.value))}
                    className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-colors duration-300"
                    required
                  >
                    <option value={12}>12 months</option>
                    <option value={36}>36 months</option>
                    <option value={60}>60 months</option>
                    <option value={84}>84 months</option>
                    <option value={120}>120 months</option>
                    <option value={180}>180 months</option>
                    <option value={240}>240 months</option>
                    <option value={300}>300 months</option>
                    <option value={360}>360 months</option>
                  </select> */}
                  <input
                    type="number"
                    // min="100"
                    // step="100"
                    value={scoreData.loanTerm || 1}
                    onChange={(e) => handleInputChange('loanTerm', parseInt(e.target.value) || 0)}
                    className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-colors duration-300"
                    required
                  />
                </div>

                {/* <div className="md:col-span-2">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={scoreData.creditHistory}
                      onChange={(e) => handleInputChange('creditHistory', e.target.checked)}
                      className="rounded border-gray-300 dark:border-gray-600 text-sky-600 focus:ring-sky-500 dark:bg-gray-700 transition-colors duration-300"
                    />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors duration-300">I have a good credit history</span>
                  </label>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 transition-colors duration-300">Check this if you have no history of loan defaults</p>
                </div> */}
                {/* Loan Information */}
              </div>
              {/* Credit History Assessment Section */}
              <div className="space-y-6 mt-8">
                <div className="border-b border-gray-200 dark:border-gray-600 pb-4 transition-colors duration-300">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center transition-colors duration-300">
                    <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/50 rounded-lg flex items-center justify-center mr-3 transition-colors duration-300">
                      <svg className="w-4 h-4 text-purple-600 dark:text-purple-400 transition-colors duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                    </div>
                    Credit History Assessment
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 mt-2 ml-11 transition-colors duration-300">
                    Banking behavior and financial patterns for accurate credit evaluation
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-300">
                      How many bank transactions have they been involved in?
                    </label>
                    <select
                      value={scoreData.bankTransactions || 'NONE'}
                      onChange={(e) => handleInputChange('bankTransactions', e.target.value)}
                      className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-colors duration-300"
                    >
                      <option value="NONE">None</option>
                      <option value="LESS_THAN_5">Less than 5</option>
                      <option value="OVER_5">Over 5</option>
                    </select>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 transition-colors duration-300">
                      Including deposits, withdrawals, transfers, etc.
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-300">
                      How many times have they borrowed money?
                    </label>
                    <select
                      value={scoreData.lendingHistory || 'NONE'}
                      onChange={(e) => handleInputChange('lendingHistory', e.target.value)}
                      className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-colors duration-300"
                    >
                      <option value="NONE">None</option>
                      <option value="LESS_THAN_5">Less than 5</option>
                      <option value="OVER_5">Over 5</option>
                    </select>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 transition-colors duration-300">
                      From banks, friends, family, or institutions
                    </p>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-300">
                      What is their most frequent cause of loans?
                    </label>
                    <select
                      value={scoreData.loanPurpose || 'BUSINESS_INVESTMENT'}
                      onChange={(e) => handleInputChange('loanPurpose', e.target.value)}
                      className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-colors duration-300"
                    >
                      <option value="BUSINESS_INVESTMENT">Business Investment</option>
                      <option value="RENTS_AND_BILLS">Rents and Bills</option>
                      <option value="CAR_PURCHASE">Car Purchase</option>
                      <option value="BUILDING_PURCHASE">Building/Property Purchase</option>
                      <option value="EDUCATION">Education</option>
                      <option value="MEDICAL_EMERGENCY">Medical Emergency</option>
                      <option value="OTHER">Other</option>
                    </select>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 transition-colors duration-300">
                      This helps understand their financial priorities and risk profile
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
                      <h4 className="font-semibold text-purple-900 dark:text-purple-200 transition-colors duration-300">
                        Automated Credit Assessment
                      </h4>
                      <p className="text-purple-700 dark:text-purple-300 text-sm mt-1 transition-colors duration-300">
                        Credit history will be automatically assessed based on banking behavior and loan patterns for more accurate evaluation.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {error && (
                <div className="bg-red-50 dark:bg-red-900/50 border border-red-200 dark:border-red-800 rounded-lg p-4 transition-colors duration-300">
                  <p className="text-red-700 dark:text-red-200 transition-colors duration-300">{error}</p>
                </div>
              )}

              <div className="flex justify-center pt-6">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="bg-gradient-to-r from-sky-500 to-teal-500 text-white px-8 py-3 rounded-lg font-medium hover:from-sky-600 hover:to-teal-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                >
                  {isLoading ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2"></div>
                      Calculating Score...
                    </div>
                  ) : (
                    'Get Credit Score'
                  )}
                </button>
              </div>
            </form>
          </div>
        ) : (
          /* Results Section */
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6 transition-colors duration-300">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 transition-colors duration-300">Your Credit Score Result</h2>
                <p className="text-gray-600 dark:text-gray-300 transition-colors duration-300">Based on the information provided</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                <div className="text-center p-8 bg-gradient-to-br from-sky-50 to-teal-50 dark:from-sky-900/30 dark:to-teal-900/30 rounded-lg border border-gray-200 dark:border-gray-600 transition-colors duration-300">
                  <div className="text-5xl font-bold text-sky-600 dark:text-sky-400 mb-3 transition-colors duration-300">
                    {result.eligibilityPercentage}%
                  </div>
                  <div className="text-gray-600 dark:text-gray-300 font-medium transition-colors duration-300">Credit Score</div>
                </div>

                <div className="text-center p-8 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/30 dark:to-emerald-900/30 rounded-lg border border-gray-200 dark:border-gray-600 transition-colors duration-300">
                  <div className={`text-3xl font-bold mb-3 transition-colors duration-300 ${result.eligible ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                    {result.eligible ? 'ELIGIBLE' : 'NOT ELIGIBLE'}
                  </div>
                  <div className="text-gray-600 dark:text-gray-300 font-medium transition-colors duration-300">AI Recommendation</div>
                </div>
              </div>

              {result.explanation && (
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6 mb-6 transition-colors duration-300">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-3 transition-colors duration-300">Score Explanation</h3>
                  <p className="text-gray-700 dark:text-gray-300 transition-colors duration-300">{result.explanation}</p>
                </div>
              )}

              <div className="bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-6 transition-colors duration-300">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-yellow-400 dark:text-yellow-300 mt-0.5 transition-colors duration-300" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-200 transition-colors duration-300">Important Notice</h3>
                    <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1 transition-colors duration-300">
                      This is a quick assessment only. Results are not saved and cannot be used for official loan applications.
                      For tracked scoring and loan management, please create an account.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={resetForm}
                  className="bg-gradient-to-r from-sky-500 to-teal-500 text-white px-6 py-3 rounded-lg font-medium hover:from-sky-600 hover:to-teal-600 transition-all duration-200"
                >
                  Score Another Person
                </button>
                <Link
                  to="/register"
                  className="border border-sky-300 dark:border-sky-600 text-sky-700 dark:text-sky-300 bg-white dark:bg-gray-800 hover:bg-sky-50 dark:hover:bg-sky-900/30 px-6 py-3 rounded-lg font-medium text-center transition-colors duration-300"
                >
                  Create Account to Track Scores
                </Link>
              </div>
            </div>

            {/* Additional Information */}
            <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6 transition-colors duration-300">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 transition-colors duration-300">Understanding Your Score</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-gray-600 dark:text-gray-300 transition-colors duration-300">
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white mb-2 transition-colors duration-300">Score Range</h4>
                  <ul className="space-y-1">
                    <li>• 80-100%: Excellent creditworthiness</li>
                    <li>• 60-79%: Good creditworthiness</li>
                    <li>• 40-59%: Fair creditworthiness</li>
                    <li>• 20-39%: Poor creditworthiness</li>
                    <li>• 0-19%: Very poor creditworthiness</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white mb-2 transition-colors duration-300">Factors Considered</h4>
                  <ul className="space-y-1">
                    <li>• Employment status and income</li>
                    <li>• Credit history and payment record</li>
                    <li>• Loan amount vs. income ratio</li>
                    <li>• Number of dependents</li>
                    <li>• Property location and type</li>
                    <li>• Education level</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default QuickScore;