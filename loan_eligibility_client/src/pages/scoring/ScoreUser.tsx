import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { searchUsers, performCreditScore } from '../../services/api';
import { useToast } from '../../context/toastContext';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { DecisionStatus } from '../../types/enums';
/* 
TODO: 
1. Implement alternative methods for taking loan history information from the user (means that are less liable to false information retrieval)

2. Implement additiinal fields that might be useful for feature training such as aim of loan, etc. 
*/

interface User {
  id: string;
  email: string;
  fullName: string;
  profile?: {
    gender: string;
    maritalStatus: string;
    dependents: number;
    education: string;
    employmentStatus: string;
    income: number;
    creditHistory: boolean;
    bankTransactions: string;
    lendingHistory: string;
    loanPurpose: string;
    propertyArea: string;
  };
}

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

export interface LoanPredictionResult {
  eligible: boolean;
  originalScore: number;
  eligibilityPercentage: number;
  maxEligibleAmount: number;
  requestedAmount: number;
  explanation: string;
}

// interface CurrencyPair { 
//   [key: string]: string; 
//   exchangeRate: number
// }

// const CurrencyPairMapping: CurrencyPair = {

// }
const ScoreUser: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [isScoring, setIsScoring] = useState(false);
  const [scoreResult, setScoreResult] = useState<LoanPredictionResult | null>(null);
  const [showManualEntry, setShowManualEntry] = useState(false);
  const { showToast } = useToast()
  const { users, saveScore } = useData()
  const { user } = useAuth()
  const [decisionSaving, setDecisionSaving] = useState(false)
  const [showResults, setShowResults] = useState(false)

  const [scoreData, setScoreData] = useState<ScoreData>({
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
    bankTransactions: 'NONE',
    lendingHistory: 'NONE',
    loanPurpose: 'OTHER',
    propertyArea: ''
  });

  const [loanDecision, setLoanDecision] = useState({
    awarded: false,
    awardedAmount: 0,
    dueDate: '',
    notes: ''
  });
  
  useEffect(() => {
    // Automatically set the awarded amount based on max eligible amount from scoring result
    if (scoreResult) {
      setLoanDecision(prev => ({
        ...prev,
        awardedAmount: scoreResult.maxEligibleAmount,
        dueDate: scoreData.loanTerm ? new Date(Date.now() + scoreData.loanTerm * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] : '',
      }));
    }
  }, [scoreResult, scoreData.loanTerm]);

  useEffect(() => {
    if (!searchQuery && users && users.length) {
      setSearchResults(users);
      return;
    }
    if (!searchQuery && !users) {
      setSearchResults([]);
    }
    if (users && users.length) {
      setSearchResults(users.filter(user =>
        user.fullName && user.fullName.toLowerCase().includes(searchQuery.toLowerCase()) || user.email && user.email.toLowerCase().includes(searchQuery.toLowerCase())))
    }

  }, [searchQuery, users])

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    try {
      const response = await searchUsers(searchQuery);
      console.log('Search results:', response.data);
      setSearchResults(response.data);
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setIsSearching(false);
    }
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
  
  const handleUserSelect = (user: User) => {
    setSelectedUser(user);
    if (user.profile) {
      setScoreData({
        ...scoreData,
        gender: user.profile.gender === 'MALE' ? 'Male' : 'Female',
        maritalStatus: user.profile.maritalStatus ? `${user.profile.maritalStatus[0].toUpperCase()}${user.profile.maritalStatus.substring(1, user.profile.maritalStatus.length).toLowerCase()}` : '',
        dependents: user.profile.dependents || 0,
        education: user.profile.education === 'GRADUATE' ? 'Graduate' : 'Not Graduate',
        employmentStatus: user.profile.employmentStatus === 'SELF_EMPLOYED' ? 'Self Employed' : user.profile.employmentStatus ? `${user.profile.employmentStatus[0].toUpperCase()}${user.profile.employmentStatus.substring(1, user.profile.employmentStatus.length).toLowerCase()}` : '',
        income: user.profile.income || 0,
        creditHistory: user.profile.creditHistory ?? true,
        propertyArea: user.profile.propertyArea === 'SEMIURBAN' ? 'Semiurban' : user.profile.propertyArea === 'URBAN' ? 'Urban' : 'Rural',
        bankTransactions: user.profile.bankTransactions || 'NONE',
        lendingHistory: user.profile.lendingHistory || 'NONE',
        loanPurpose: user.profile.loanPurpose || 'OTHER',
      });
    }
    setSearchResults([]);
    setSearchQuery('');
  };
  
  const handleInputChange = (field: keyof ScoreData, value: string | number | boolean) => {
    setScoreData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  function processScoreResult(scoreResult: LoanPredictionResult) {
    let explanation = "";
    let eligibilityPercentage =  scoreResult.eligibilityPercentage;
    let eligible = scoreResult.eligible;
    let maxEligibleAmount = Math.ceil(scoreResult.maxEligibleAmount * 100000)
    let originalScore = scoreResult.originalScore;
    let requestedAmount =  Math.ceil(scoreResult.requestedAmount * 100000)

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

  const handlePerformScore = async () => {

    console.log('Original scoreData:', scoreData);

    // Transform data to match backend expectations - using camelCase for API
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
    })

    const currencyTransformedData = {
      ...transformedData,
      loanAmount: transformedData.loanAmount / 100,
      coApplicantIncome: transformedData.coApplicantIncome / 100,
      income: transformedData.income / 100,
      loanTerm: (transformedData.loanTerm / 12) * 360
    }

    try {
      setIsScoring(true);
      const response = await performCreditScore(currencyTransformedData);
      console.log("here is the response of the scoring", response.data)
      // const { requestedAmount, maxEligibleAmount, eligibilityPercentage } = response.data
      const result: LoanPredictionResult = processScoreResult(response.data as LoanPredictionResult)
      console.log(result)
      setScoreResult(result);
    } catch (error: any) {
      console.error('Scoring failed:', error);
      // showToast('Failed to perform scoring. Please check your inputs and try again.', 'error');
      if (Array.isArray(error.response.data.detail)) {
        showToast(`${error.response.data.detail[0].loc[1]} ${error.response.data.detail[0].msg}`, 'error');
      } else {
        if (error.response.data.detail && typeof error.response.data.detail === 'string') showToast(error.response.data.detail)
      }
    } finally {
      setIsScoring(false);
    }
  };

  const handleSaveScore = async () => {
    if (!scoreResult) return;
    setDecisionSaving(true)
    const processedData = processScoringData(scoreData);
    try {
      await saveScore({
        scoreduserId: selectedUser ? selectedUser.id : "",
        scorerId: user ? user.id : "",
        score: scoreResult.originalScore,
        eligible: scoreResult.eligible,
        ...loanDecision,
        decisionStatus: loanDecision.awarded ? DecisionStatus.AWARDED : DecisionStatus.DECLINED,
        ...processedData,
        amount: processedData.loanAmount,
        term: processedData.loanTerm,
      });
      setDecisionSaving(false)
      navigate('/my-scores');
    } catch (error: any) {
      setDecisionSaving(false)
      if (Array.isArray(error.response.data.detail)) {
        showToast(`${error.response.data.detail[0].loc[1]} ${error.response.data.detail[0].msg}`, 'error');
      } else {
        if (error.response.data.detail && typeof error.response.data.detail === 'string') showToast(error.response.data.detail)
      }
      console.error('Failed to save score:', error);
    }
  };
  
  useEffect(() => {
    const handleClickOutside = (e: Event) => {
      const mouseEvent = e as MouseEvent;
      const target = mouseEvent.target as HTMLElement;

      // Check if the clicked element is the search input or inside the search results dropdown
      const searchInput = document.querySelector('input[placeholder="Search by name or email..."]');
      const searchDropdown = document.querySelector('.absolute.z-10.w-full.mt-2');

      if (searchInput && searchDropdown) {
        const isClickOnInput = searchInput.contains(target);
        const isClickOnDropdown = searchDropdown.contains(target);

        if (!isClickOnInput && !isClickOnDropdown) {
          setShowResults(false);
        }
      } else if (searchInput && !searchInput.contains(target)) {
        setShowResults(false);
      }
    };

    document.addEventListener('click', handleClickOutside);

    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [])

  return (
    <div className="max-w-4xl mx-auto py-6 px-4 sm:px-6 lg:px-8 box-content">
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 transition-colors duration-300">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 transition-colors duration-300">Perform Credit Scoring</h1>

        {!scoreResult && (
          <>
            {/* User Search Section */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-medium text-gray-900 dark:text-white transition-colors duration-300">Find User to Score {showResults && `(${searchResults.length} results found)`}</h2>
                <button
                  onClick={() => setShowManualEntry(!showManualEntry)}
                  className="text-sky-600 dark:text-sky-400 hover:text-sky-700 dark:hover:text-sky-300 text-sm font-medium transition-colors duration-300"
                >
                  {showManualEntry ? 'Search for User Instead' : 'Enter Information Manually'}
                </button>
              </div>

              {!showManualEntry && (
                <div className="relative">
                  <div className="flex space-x-4">
                    <input
                      type="text"
                      placeholder="Search by name or email..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onFocus={() => setShowResults(true)}
                      // onC={() => setShowResults(false)}
                      className="flex-1 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-300 focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-colors duration-300"
                      onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                    />
                    <button
                      onClick={handleSearch}
                      disabled={isSearching}
                      className="bg-gradient-to-r from-sky-500 to-teal-500 text-white px-6 py-2 rounded-lg font-medium hover:from-sky-600 hover:to-teal-600 disabled:opacity-50 transition-all duration-300"
                    >
                      {isSearching ? 'Searching...' : 'Search'}
                    </button>
                  </div> {searchResults.length > 0 && showResults && (
                    <div className="absolute z-10 w-full mt-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg max-h-60 overflow-y-auto transition-colors duration-300">
                      {searchResults.map((user) => (
                        <button
                          key={user.id}
                          onClick={() => handleUserSelect(user)}
                          className="w-full text-left px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-600 border-b border-gray-100 dark:border-gray-600 last:border-b-0 transition-colors duration-300"
                        >
                          <p className="font-medium text-gray-900 dark:text-white transition-colors duration-300">{user.fullName}</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400 transition-colors duration-300">{user.email}</p>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {selectedUser && (
                <div className="mt-4 p-4 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-lg transition-colors duration-300">
                  <p className="text-green-800 dark:text-green-200 transition-colors duration-300">
                    <strong>Selected User:</strong> {selectedUser.fullName} ({selectedUser.email})
                  </p>
                </div>
              )}
            </div>

            {/* Scoring Form */}
            {(selectedUser || showManualEntry) && (
              <div className="space-y-6">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white transition-colors duration-300">
                  {selectedUser ? 'Review and Update Information' : 'Enter Information to Score'}
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-300">Gender</label>
                    <select
                      value={scoreData.gender}
                      onChange={(e) => handleInputChange('gender', e.target.value)}
                      className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-colors duration-300"
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
                      value={scoreData.dependents}
                      onChange={(e) => handleInputChange('dependents', parseInt(e.target.value) || 0)}
                      className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-colors duration-300"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-300">Education</label>
                    <select
                      value={scoreData.education}
                      onChange={(e) => handleInputChange('education', e.target.value)}
                      className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-colors duration-300"
                    >
                      <option value="">Select Education</option>
                      <option value="Graduate">Graduate</option>
                      <option value="Not Graduate">Not Graduate</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-300">Employment Status</label>
                    <select
                      value={scoreData.employmentStatus}
                      onChange={(e) => handleInputChange('employmentStatus', e.target.value)}
                      className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-colors duration-300"
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
                      value={scoreData.income}
                      onChange={(e) => handleInputChange('income', parseFloat(e.target.value) || 0)}
                      className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-colors duration-300"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-300">Co-Applicant Income (XAF)</label>
                    <input
                      type="number"
                      min="0"
                      value={scoreData.coApplicantIncome}
                      onChange={(e) => handleInputChange('coApplicantIncome', parseFloat(e.target.value) || 0)}
                      className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-colors duration-300"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-300">Requested Loan Amount (XAF)</label>
                    <input
                      type="number"
                      min="0"
                      value={scoreData.loanAmount}
                      onChange={(e) => handleInputChange('loanAmount', parseFloat(e.target.value) || 0)}
                      className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-colors duration-300"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-300">Loan Term (months)</label>
                    <input
                      type="number"
                      min="1"
                      value={scoreData.loanTerm}
                      onChange={(e) => handleInputChange('loanTerm', parseInt(e.target.value) || 12)}
                      className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-colors duration-300"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-300">Property Area</label>
                    <select
                      value={scoreData.propertyArea}
                      onChange={(e) => handleInputChange('propertyArea', e.target.value)}
                      className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-colors duration-300"
                    >
                      <option value="">Select Area</option>
                      <option value="Urban">Urban</option>
                      <option value="Semiurban">Semi-urban</option>
                      <option value="Rural">Rural</option>
                    </select>
                  </div>
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
                        value={scoreData.bankTransactions}
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
                        value={scoreData.lendingHistory}
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
                        value={scoreData.loanPurpose}
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

                <div className="md:col-span-2">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={scoreData.creditHistory}
                      onChange={(e) => handleInputChange('creditHistory', e.target.checked)}
                      className="rounded border-gray-300 dark:border-gray-600 text-sky-600 focus:ring-sky-500 dark:bg-gray-700 transition-colors duration-300"
                      disabled
                    />
                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400 transition-colors duration-300">
                      Credit History (Automatically Calculated)
                    </span>
                  </label>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 ml-6 transition-colors duration-300">
                    This value will be calculated automatically based on the assessment above
                  </p>
                </div>

                <div className="flex justify-end">
                  <button
                    onClick={handlePerformScore}
                    disabled={isScoring}
                    className="bg-gradient-to-r from-sky-500 to-teal-500 text-white px-8 py-3 rounded-lg font-medium hover:from-sky-600 hover:to-teal-600 disabled:opacity-50 transition-all duration-300"
                  >
                    {isScoring ? 'Scoring...' : 'Perform Credit Score'}
                  </button>
                </div>
              </div>
            )}
          </>
        )}

        {/* Score Results */}        {scoreResult && (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-sky-50 to-teal-50 dark:from-sky-900/30 dark:to-teal-900/30 p-6 rounded-lg border border-sky-200 dark:border-sky-800 transition-colors duration-300">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 transition-colors duration-300">Credit Score Result</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 transition-colors duration-300">Eligibility Percentage</p>
                  <p className="text-3xl font-bold text-sky-600 dark:text-sky-400 transition-colors duration-300">
                    {scoreResult.eligibilityPercentage.toFixed(1)}%
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 transition-colors duration-300">AI Recommendation</p>
                  <p className={`text-lg font-semibold transition-colors duration-300 ${scoreResult.eligible ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                    {scoreResult.eligible ? 'Eligible for Loan' : 'Not Eligible for Loan'}
                  </p>
                </div>
              </div>

              {/* Additional Information */}
              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1 transition-colors duration-300">Requested Amount</p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white transition-colors duration-300">
                    XAF {(scoreResult.requestedAmount).toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1 transition-colors duration-300">Maximum Eligible Amount</p>
                  <p className="text-lg font-semibold text-green-600 dark:text-green-400 transition-colors duration-300">
                    XAF {(scoreResult.maxEligibleAmount).toLocaleString()}
                  </p>
                </div>
              </div>

              {/* Explanation */}
              <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  {scoreResult.explanation}
                </p>
              </div>
            </div>

            {/* Loan Decision */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 transition-colors duration-300">Your Decision</h3>
              <div className="space-y-4">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={loanDecision.awarded}
                    onChange={(e) => setLoanDecision(prev => ({ ...prev, awarded: e.target.checked }))}
                    className="rounded border-gray-300 dark:border-gray-600 text-sky-600 focus:ring-sky-500 dark:bg-gray-700 transition-colors duration-300"
                  />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors duration-300">Award Loan</span>
                </label>

                {loanDecision.awarded && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-300">Awarded Amount (XAF)</label>
                      <input
                        type="number"
                        min="0"
                        value={loanDecision.awardedAmount}
                        onChange={(e) => setLoanDecision(prev => ({ ...prev, awardedAmount: parseFloat(e.target.value) || 0 }))}
                        className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-colors duration-300"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-300">Due Date</label>
                      <input
                        type="date"
                        value={loanDecision.dueDate || new Date().toISOString().split('T')[0]}
                        onChange={(e) => setLoanDecision(prev => ({ ...prev, dueDate: e.target.value }))}
                        className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-colors duration-300"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-300">Notes</label>
                  <textarea
                    value={loanDecision.notes}
                    onChange={(e) => setLoanDecision(prev => ({ ...prev, notes: e.target.value }))}
                    rows={3}
                    className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-300 focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-colors duration-300"
                    placeholder="Optional notes about your decision..."
                  />
                </div>
              </div>
            </div>

            <div className="flex space-x-4">
              <button
                onClick={handleSaveScore}
                disabled={decisionSaving}
                className="bg-gradient-to-r from-sky-500 to-teal-500 text-white px-8 py-3 rounded-lg font-medium hover:from-sky-600 hover:to-teal-600 transition-all duration-300"
              >
                {decisionSaving ? "Saving..." : "Save Score & Decision"}
              </button>
              <button
                onClick={() => {
                  setScoreResult(null);
                  setSelectedUser(null);
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
                    bankTransactions: 'NONE',
                    lendingHistory: 'NONE',
                    loanPurpose: 'OTHER',
                    propertyArea: ''
                  });
                }}
                className="border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 px-8 py-3 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors duration-300"
              >
                Score Another Person
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ScoreUser;