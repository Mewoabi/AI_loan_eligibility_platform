from pydantic import BaseModel, EmailStr, Field, validator
from typing import Optional, List
from enum import Enum
from datetime import datetime
from prisma.enums import (
    EmploymentStatus, DecisionStatus, Education, Gender, MaritalStatus,
    LoanOutcome, PropertyArea, TransactionFrequency, LendingFrequency, LoanPurpose
)
from prisma.models import CreditAssessment

# Models for authentication


class UserCreate(BaseModel):
    email: EmailStr
    password: str


class UserResponse(BaseModel):
    id: str
    email: EmailStr
    createdAt: datetime

    class Config:
        from_attributes = True


class TokenData(BaseModel):
    id: str
    email: EmailStr


class Token(BaseModel):
    accessToken: str
    tokenType: str


# Models for profile
class ProfileSummary(BaseModel):
    gender: Optional[Gender] = None
    maritalStatus: Optional[MaritalStatus] = None
    dependents: Optional[int] = None
    education: Optional[Education] = None
    employmentStatus: Optional[EmploymentStatus] = None
    income: Optional[float] = None
    creditHistory: Optional[bool] = None
    propertyArea: Optional[PropertyArea] = None
    bankTransactions: Optional[TransactionFrequency] = None
    lendingHistory: Optional[LendingFrequency] = None
    loanPurpose: Optional[LoanPurpose] = None


class ProfileCreate(BaseModel):
    fullName: Optional[str] = None
    nationalId: Optional[str] = None
    gender: Optional[Gender] = Gender.MALE
    maritalStatus: Optional[MaritalStatus] = MaritalStatus.SINGLE
    dependents: Optional[int] = Field(None, ge=0)
    education: Optional[Education] = Education.NOT_GRADUATE
    employmentStatus: Optional[EmploymentStatus] = EmploymentStatus.UNEMPLOYED
    income: Optional[float] = Field(None, gt=0)
    coApplicantIncome: Optional[float] = Field(None, ge=0)
    creditHistory: Optional[bool] = Field(default=False)
    bankTransactions: Optional[TransactionFrequency] = None
    lendingHistory: Optional[LendingFrequency] = None
    loanPurpose: Optional[LoanPurpose] = None
    propertyArea: Optional[PropertyArea] = PropertyArea.RURAL

    class Config:
        from_attributes = True


class ProfileResponse(ProfileCreate):
    id: str
    userId: str
    createdAt: datetime
    updatedAt: datetime

    class Config:
        from_attributes = True


class UserSearchResult(BaseModel):
    id: str
    email: EmailStr
    createdAt: datetime
    fullName: Optional[str] = None
    profile: Optional[ProfileSummary] = None

    class Config:
        from_attributes = True


# Models for loan application
class LoanDto(BaseModel):
    gender: Gender
    maritalStatus: MaritalStatus
    dependents: int = Field(ge=0)
    education: Education
    employmentStatus: EmploymentStatus
    income: float = Field(gt=0)
    coApplicantIncome: float = Field(ge=0)
    loanAmount: float = Field(gt=0)
    loanTerm: int = Field(gt=0)
    creditHistory: bool
    propertyArea: PropertyArea
    bankTransactions: Optional[TransactionFrequency] = None
    lendingHistory: Optional[LendingFrequency] = None
    loanPurpose: Optional[LoanPurpose] = None


class CreditAssessmentCreate(CreditAssessment):
    id: Optional[str] = None
    createdAt: Optional[datetime] = None
    updatedAt: Optional[datetime] = None


class CreditAssessmentUpdate(BaseModel):
    decisionStatus: Optional[DecisionStatus] = DecisionStatus.PENDING
    awardedAmount: Optional[float] = Field(None, gt=0)
    dueDate: Optional[datetime] = None
    outcomeStatus: Optional[LoanOutcome] = LoanOutcome.IN_PROGRESS
    notes: Optional[str] = None


class CreditAssessmentResponse(BaseModel):
    id: str
    scoreduserId: str
    scorerId: Optional[str] = None
    amount: float
    term: int
    gender: Gender
    maritalStatus: MaritalStatus
    dependents: int
    education: Education
    employmentStatus: EmploymentStatus
    income: float
    coApplicantIncome: float
    creditHistory: bool
    propertyArea: PropertyArea
    score: Optional[float] = None
    eligible: Optional[bool] = None
    decisionStatus: Optional[DecisionStatus] = DecisionStatus.PENDING
    awardedAmount: Optional[float] = None
    dueDate: Optional[datetime] = None
    outcomeStatus: Optional[LoanOutcome] = LoanOutcome.IN_PROGRESS
    notes: Optional[str] = None
    createdAt: datetime
    updatedAt: datetime
    scoreData: Optional[dict] = None  # For storing original score data

    class Config:
        from_attributes = True

# Keep legacy models for backward compatibility
class LoanApplicationCreate(LoanDto):
    pass

class LoanApplicationUpdate(CreditAssessmentUpdate):
    pass

class LoanApplicationResponse(CreditAssessmentResponse):
    pass


class LoanPredictionResponse(BaseModel):
    eligible: bool
    originalScore: float
    eligibilityPercentage: float
    maxEligibleAmount: float
    requestedAmount: float
    explanation: str


class RecentScore(BaseModel):
    id: str
    scoredUserName: str
    score: float
    date: str
    decisionStatus: Optional[str] = None


class DashboardStats(BaseModel):
    totalScoresPerformed: int
    totalScoresReceived: int
    totalLoansTracked: int
    successfulRepayments: int
    pendingLoans: int
    recentScores: List[RecentScore]


# UNUSED ENUMS SINCE THEY ARE ALREADY DEFINED IN prisma.enums
# class Gender(str, Enum):
#     MALE = "MALE"
#     FEMALE = "FEMALE"
#     OTHER = "OTHER"


# class MaritalStatus(str, Enum):
#     SINGLE = "SINGLE"
#     MARRIED = "MARRIED"
#     DIVORCED = "DIVORCED"
#     WIDOWED = "WIDOWED"


# class Education(str, Enum):
#     GRADUATE = "GRADUATE"
#     NOT_GRADUATE = "NOT_GRADUATE"


# class EmploymentStatus(str, Enum):
#     EMPLOYED = "EMPLOYED"
#     SELF_EMPLOYED = "SELF_EMPLOYED"
#     UNEMPLOYED = "UNEMPLOYED"
#     STUDENT = "STUDENT"


# class PropertyArea(str, Enum):
#     URBAN = "URBAN"
#     SEMIURBAN = "SEMIURBAN"
#     RURAL = "RURAL"


# class DecisionStatus(str, Enum):
#     PENDING = "PENDING"
#     AWARDED = "AWARDED"
#     DECLINED = "DECLINED"


# class LoanOutcome(str, Enum):
#     IN_PROGRESS = "IN_PROGRESS"
#     PAID = "PAID"
#     DEFAULTED = "DEFAULTED"
