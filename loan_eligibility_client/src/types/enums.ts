export const Gender = {
    MALE: 'MALE',
    FEMALE: 'FEMALE',
    OTHER: 'OTHER'
} as const;

export const MaritalStatus = {
    SINGLE: 'SINGLE',
    MARRIED: 'MARRIED',
    DIVORCED: 'DIVORCED',
    WIDOWED: 'WIDOWED'
} as const;

export const Education = {
    GRADUATE: 'GRADUATE',
    NOT_GRADUATE: 'NOT_GRADUATE'
} as const;

export const EmploymentStatus = {
    EMPLOYED: 'EMPLOYED',
    SELF_EMPLOYED: 'SELF_EMPLOYED',
    UNEMPLOYED: 'UNEMPLOYED',
    STUDENT: 'STUDENT'
} as const;

export const PropertyArea = {
    URBAN: 'URBAN',
    SEMIURBAN: 'SEMIURBAN',
    RURAL: 'RURAL'
} as const;

export const DecisionStatus = {
    PENDING: 'PENDING',
    AWARDED: 'AWARDED',
    DECLINED: 'DECLINED',
    AWARDED_AND_TAKEN: 'AWARDED_AND_TAKEN'
} as const;

export const LoanOutcome = {
    IN_PROGRESS: 'IN_PROGRESS',
    PAID: 'PAID',
    DEFAULTED: 'DEFAULTED'
} as const;

export const TransactionFrequency = {
    NONE: 'NONE',
    LESS_THAN_5: 'LESS_THAN_5',
    OVER_5: 'OVER_5'
} as const;

export const LendingFrequency = {
    NONE: 'NONE',
    LESS_THAN_5: 'LESS_THAN_5',
    OVER_5: 'OVER_5'
} as const;

export const LoanPurpose = {
    BUSINESS_INVESTMENT: 'BUSINESS_INVESTMENT',
    RENTS_AND_BILLS: 'RENTS_AND_BILLS',
    CAR_PURCHASE: 'CAR_PURCHASE',
    BUILDING_PURCHASE: 'BUILDING_PURCHASE',
    EDUCATION: 'EDUCATION',
    MEDICAL_EMERGENCY: 'MEDICAL_EMERGENCY',
    OTHER: 'OTHER'
} as const;

// Type definitions for type safety
export type Gender = typeof Gender[keyof typeof Gender];
export type MaritalStatus = typeof MaritalStatus[keyof typeof MaritalStatus];
export type Education = typeof Education[keyof typeof Education];
export type EmploymentStatus = typeof EmploymentStatus[keyof typeof EmploymentStatus];
export type PropertyArea = typeof PropertyArea[keyof typeof PropertyArea];
export type DecisionStatus = typeof DecisionStatus[keyof typeof DecisionStatus];
export type LoanOutcome = typeof LoanOutcome[keyof typeof LoanOutcome];
export type TransactionFrequency = typeof TransactionFrequency[keyof typeof TransactionFrequency];
export type LendingFrequency = typeof LendingFrequency[keyof typeof LendingFrequency];
export type LoanPurpose = typeof LoanPurpose[keyof typeof LoanPurpose];


    // console.log('Transformed data:', transformedData);
    // setScoreResult({
    //   eligible: true, 
    //   originalScore: 0.95, 
    //   eligibilityPercentage: 95, 
    //   maxEligibleAmount: 1000,
    //   requestedAmount: 500,
    //   explanation: 'This user is eligible for a loan of XAF 500,000. They are also eligible for loans up to XAF 1,000,000 on these same terms.'
    // })

