import os
import jwt
import joblib
import numpy as np
import pandas as pd
from typing import Union, Optional, List
from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from fastapi.middleware.cors import CORSMiddleware
from prisma import Prisma
from prisma.models import User, Profile, CreditAssessment
from prisma.types import UserCreateInput, ProfileCreateInput, ProfileUpdateInput, CreditAssessmentCreateInput, CreditAssessmentUpdateInput
from datetime import datetime, timedelta
from pydantic import BaseModel, Field
import numpy as np
import joblib
import pandas as pd
import os
from pathlib import Path
import jwt
from passlib.context import CryptContext
from loanModel import (
    UserCreate, UserResponse, Token, TokenData, ProfileCreate, ProfileResponse,
    LoanDto, CreditAssessmentCreate, CreditAssessmentUpdate, CreditAssessmentResponse,
    LoanPredictionResponse, Gender, MaritalStatus, Education, EmploymentStatus,
    PropertyArea, DecisionStatus, LoanOutcome, UserSearchResult, ProfileSummary,
    TransactionFrequency, LendingFrequency, LoanPurpose, DashboardStats, RecentScore,
    # Keep legacy imports for backward compatibility
    LoanApplicationCreate, LoanApplicationUpdate, LoanApplicationResponse
)

# Initialize FastAPI app
app = FastAPI(
    title="Loan Eligibility API",
    description="AI-Powered Loan Eligibility Scoring and Tracking System",
    version="1.0.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

model = None


@app.on_event("startup")
async def startup_event():
    global model
    try:
        # script_dir = Path(__file__).parent
        # model_path = script_dir / "loan_elig_predictor"

        # with open('loan_elig_predictor.pkl', "rb") as f:
        #     model = pickle.load(f)
        # model_path = "C:\\Users\\mewoa\\loan_elig_predictor_new"
        model_path='./loan_elig_predictor_new'
        # model_path = "C:\\Users\\mewoa\\Studies\\loan_elig_predictor"
        if not os.path.exists(model_path):
            raise HTTPException(status_code=500, detail="Model file not found")

        model = joblib.load(model_path)
        print("Model loaded successfully")
    except Exception as e:
        print(f"Error loading model: {e}")
        model = None

# Security utilities
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")
# In production, use environment variable
SECRET_KEY = "THIS IS THE KEY FOR THE FINAL YEAR PROJECT VERSION1.000 WITH SOME ADDITIONAL 12-3492840-23"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60*24  # 24 hours

# Database connection helper


def get_db():
    db = Prisma()
    try:
        db.connect()
        yield db
    except Exception as e:
        # Log the error and raise an HTTP exception that will be picked up by the frontend
        print(f"Database connection error: {e}")
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Database connection failed. Please try again later."
        )
    finally:
        try:
            db.disconnect()
        except Exception as disconnect_error:
            # Log disconnect errors but don't raise them to avoid masking the original error
            print(f"Database disconnect error: {disconnect_error}")

# Authentication utilities


def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password):
    return pwd_context.hash(password)


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


async def get_current_user(token: str = Depends(oauth2_scheme), db: Prisma = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")
        print(payload, 'trying to decode token')
        if user_id is None:
            raise credentials_exception
        token_data = TokenData(id=user_id, email=payload.get("email"))
    except Exception:
        raise credentials_exception
    user = db.user.find_unique(where={"id": token_data.id})
    if user is None:
        raise credentials_exception
    return user


def assess_credit_history(
    bank_transactions: Optional[TransactionFrequency],
    lending_history: Optional[LendingFrequency],
    loan_purpose: Optional[LoanPurpose]
) -> bool:
    """
    Assess credit history based on banking behavior and loan patterns.
    Returns True if the user likely has good credit history, False otherwise.
    """
    if not all([bank_transactions, lending_history, loan_purpose]):
        # If any field is missing, default to False for safety
        return False

    score = 0

    # Bank transactions scoring (0-40 points)
    if bank_transactions == TransactionFrequency.OVER_5:
        score += 40  # High banking activity suggests financial engagement
    elif bank_transactions == TransactionFrequency.LESS_THAN_5:
        score += 20  # Some banking activity is positive
    # NONE = 0 points (no banking activity is concerning)

    # Lending history scoring (0-35 points)
    if lending_history == LendingFrequency.LESS_THAN_5:
        score += 35  # Moderate lending suggests responsible borrowing
    elif lending_history == LendingFrequency.OVER_5:
        score += 15  # Too much lending might indicate financial stress
    # NONE = 0 points (no lending history means no track record)

    # Loan purpose scoring (0-25 points)
    if loan_purpose == LoanPurpose.BUSINESS_INVESTMENT:
        score += 25  # Investment loans suggest financial planning
    elif loan_purpose == LoanPurpose.EDUCATION:
        score += 20  # Education loans are generally positive
    elif loan_purpose == LoanPurpose.BUILDING_PURCHASE:
        score += 18  # Real estate investment is positive
    elif loan_purpose == LoanPurpose.CAR_PURCHASE:
        score += 15  # Asset purchase is reasonable
    elif loan_purpose == LoanPurpose.RENTS_AND_BILLS:
        score += 10  # Bills might indicate financial stress but shows responsibility
    elif loan_purpose == LoanPurpose.MEDICAL_EMERGENCY:
        score += 8   # Emergency loans are necessary but indicate vulnerability
    elif loan_purpose == LoanPurpose.OTHER:
        score += 5   # Unknown purpose is less favorable

    # Credit history is considered good if score >= 60 out of 100
    return score >= 60


def process_loan_data_for_prediction(loan: LoanDto):
    """Process loan data into format expected by the model"""
    # Convert categorical variables to numerical format expected by model
    # Keep snake_case field names for model compatibility
    print(loan, "this is the loan data before processing")

    calculated_credit_history = assess_credit_history(
        loan.bankTransactions, loan.lendingHistory, loan.loanPurpose)

    data = {
        'Gender': 1 if loan.gender == Gender.MALE else 0,  # Male: 1, Female: 0
        # Married: 1, Others: 0
        'Married': 1 if loan.maritalStatus == MaritalStatus.MARRIED else 0,
        'Dependents': loan.dependents,
        # Graduate: 1, Not Graduate: 0
        'Education': 1 if loan.education == Education.GRADUATE else 0,
        'Self_Employed': 1 if loan.employmentStatus == EmploymentStatus.SELF_EMPLOYED else 0,
        'ApplicantIncome': loan.income,
        'CoapplicantIncome': loan.coApplicantIncome,
        'LoanAmount': loan.loanAmount,
        'Loan_Amount_Term': loan.loanTerm,
        # 'Credit_History': 1 if loan.creditHistory else 0,
        'Credit_History': 1 if calculated_credit_history else 0,
        'Property_Area': 0 if loan.propertyArea == PropertyArea.RURAL else 1 if loan.propertyArea == PropertyArea.URBAN else 2,
    }
    #first let's scale and normalize the numerical rows out of range
    df = pd.DataFrame([data])
    df['ApplicantIncome'] = np.log1p(df['ApplicantIncome'])
    df['CoapplicantIncome'] = np.log1p(df['CoapplicantIncome'])
    df['LoanAmount'] = np.log1p(df['LoanAmount'])
    df['Loan_Amount_Term'] = np.log1p(df['Loan_Amount_Term'])
    print('this is the data processed for scoring',df)
    return df



def find_maximum_eligible_amount(loan: LoanDto, orig_amount: float):
    """
    Find the maximum eligible loan amount (in thousands) and the score at the requested amount.
    If the user is eligible for the requested amount (score >= 0.5), increment the amount until ineligible.
    If not eligible, decrement until eligible or zero.
    Returns (max_eligible_amount, original_score)
    """
    if model is None:
        return 0.0, 0.0
    # Prepare feature template once
    base_df = process_loan_data_for_prediction(loan)
    # Get the model's probability for the requested amount
    test_df = base_df.copy()
    test_df.loc[0, 'LoanAmount'] = orig_amount
    proba = model.predict_proba(test_df)[0][1]
    eligible = proba >= 0.5
    step = 0.1  # in thousands (₣100)
    max_iter = 1000
    if eligible:
        # Increment until ineligible
        current = orig_amount
        last_eligible = orig_amount
        for _ in range(max_iter):
            current += step
            test_df = base_df.copy()
            test_df.loc[0, 'LoanAmount'] = current
            proba_next = model.predict_proba(test_df)[0][1]
            if proba_next >= 0.5:
                last_eligible = current
            else:
                break
        return round(last_eligible, 2), proba
    else:
        # Decrement until eligible or zero
        current = orig_amount
        last_eligible = 0.0
        for _ in range(max_iter):
            current -= step
            if current <= 0:
                current = 0.0
                break
            test_df = base_df.copy()
            test_df.loc[0, 'LoanAmount'] = current
            proba_next = model.predict_proba(test_df)[0][1]
            if proba_next >= 0.5:
                last_eligible = current
                break
        return round(last_eligible, 2), proba

# Authentication routes


@app.post("/auth/register", response_model=UserResponse, tags=["Authentication"])
def register_user(user: UserCreate, db: Prisma = Depends(get_db)):
    print('trying to register user:', user.email)
    # Check if user already exists
    db_user = db.user.find_unique(where={"email": user.email})
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")

    hashed_password = get_password_hash(user.password)
    user_data: UserCreateInput = {
        "email": user.email,
        "password": hashed_password,
    }
    created_user = db.user.create(data=user_data)

    # Convert database object to response model with proper field mapping
    return UserResponse(
        id=created_user.id,
        email=created_user.email,
        createdAt=created_user.createdAt
    )


@app.post("/auth/token", response_model=Token, tags=["Authentication"])
def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends(), db: Prisma = Depends(get_db)):
    user = db.user.find_unique(where={"email": form_data.username})
    if not user or not verify_password(form_data.password, user.password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    accessToken = create_access_token(
        data={"sub": user.id, "email": user.email},
        expires_delta=access_token_expires
    )

    return {"accessToken": accessToken, "tokenType": "bearer"}

# User profile routes


@app.get("/users/me", response_model=UserResponse, tags=["Users"])
def read_users_me(current_user: User = Depends(get_current_user)):
    return UserResponse(
        id=current_user.id,
        email=current_user.email,
        createdAt=current_user.createdAt
    )


@app.get("/users/search", response_model=List[UserSearchResult], tags=["Users"])
def search_users(
    q: str,
    current_user: User = Depends(get_current_user),
    db: Prisma = Depends(get_db)
):
    """Search for users by email or full name"""
    # if not q or len(q.strip()) < 2:
    #     raise HTTPException(status_code=400, detail="Search query must be at least 2 characters long")

    search_term = q.strip().lower()

    # Search users by email or profile full name
    # First get users whose email contains the search term
    users_by_email = db.user.find_many(
        where={
            "email": {
                "contains": search_term,
                "mode": "insensitive"
            }
        },
        include={"profile": True}
    )

    # Then get users whose profile full name contains the search term
    users_by_name = db.user.find_many(
        where={
            "profile": {
                "is": {
                    "fullName": {
                        "contains": search_term,
                        "mode": "insensitive"
                    }
                }
            }
        },
        include={"profile": True}
    )

    # Combine results and remove duplicates
    user_dict = {}
    for user in users_by_email + users_by_name:
        user_dict[user.id] = user

    del user_dict[current_user.id]  # Exclude current user from search results

    # Convert to response format
    search_results = []
    for user in user_dict.values():
        profile_summary = None
        if user.profile:
            profile_summary = ProfileSummary(
                gender=user.profile.gender,
                maritalStatus=user.profile.maritalStatus,
                dependents=user.profile.dependents,
                education=user.profile.education,
                employmentStatus=user.profile.employmentStatus,
                income=user.profile.income,
                creditHistory=user.profile.creditHistory,
                propertyArea=user.profile.propertyArea,
                bankTransactions=user.profile.bankTransactions,
                lendingHistory=user.profile.lendingHistory,
                loanPurpose=user.profile.loanPurpose
            )

        user_result = UserSearchResult(
            id=user.id,
            email=user.email,
            createdAt=user.createdAt,
            fullName=user.profile.fullName if user.profile else None,
            profile=profile_summary
        )
        search_results.append(user_result)

    # Limit results to 10 to avoid overwhelming the UI
    return search_results[:10]


@app.post("/users/profile", response_model=ProfileResponse, tags=["Profiles"])
def create_profile(
    profile: ProfileCreate,
    current_user: User = Depends(get_current_user),
    db: Prisma = Depends(get_db)
):
    # Check if profile already exists
    existing_profile = db.profile.find_unique(
        where={"userId": current_user.id})
    if existing_profile:
        raise HTTPException(status_code=400, detail="Profile already exists")

    # Automatically assess credit history based on new fields
    assessed_credit_history = assess_credit_history(
        profile.bankTransactions,
        profile.lendingHistory,
        profile.loanPurpose
    )

    # Create new profile for the user
    profile_data: ProfileCreateInput = {
        "userId": current_user.id,
        "fullName": profile.fullName,
        "nationalId": profile.nationalId,
        "gender": profile.gender,
        "maritalStatus": profile.maritalStatus,
        "dependents": profile.dependents,
        "education": profile.education,
        "employmentStatus": profile.employmentStatus,
        "income": profile.income,
        "coApplicantIncome": profile.coApplicantIncome,
        "creditHistory": assessed_credit_history,  # Use assessed value
        "bankTransactions": profile.bankTransactions,
        "lendingHistory": profile.lendingHistory,
        "loanPurpose": profile.loanPurpose,
        "propertyArea": profile.propertyArea,
    }

    created_profile = db.profile.create(data=profile_data)
    return created_profile


@app.put("/users/profile", response_model=ProfileResponse, tags=["Profiles"])
def update_profile(
    profile: ProfileCreate,
    current_user: User = Depends(get_current_user),
    db: Prisma = Depends(get_db)
):
    # Check if profile exists
    existing_profile = db.profile.find_unique(
        where={"userId": current_user.id})
    if not existing_profile:
        raise HTTPException(status_code=404, detail="Profile not found")

    # Automatically assess credit history based on new fields
    assessed_credit_history = assess_credit_history(
        profile.bankTransactions,
        profile.lendingHistory,
        profile.loanPurpose
    )

    # Update profile
    profile_data: ProfileUpdateInput = {
        "fullName": profile.fullName,
        "nationalId": profile.nationalId,
        "gender": profile.gender,
        "maritalStatus": profile.maritalStatus,
        "dependents": profile.dependents,
        "education": profile.education,
        "employmentStatus": profile.employmentStatus,
        "income": profile.income,
        "coApplicantIncome": profile.coApplicantIncome,
        "creditHistory": assessed_credit_history,  # Use assessed value
        "bankTransactions": profile.bankTransactions,
        "lendingHistory": profile.lendingHistory,
        "loanPurpose": profile.loanPurpose,
        "propertyArea": profile.propertyArea,
    }

    updated_profile = db.profile.update(
        where={"userId": current_user.id},
        data=profile_data
    )
    return updated_profile


@app.get("/users/profile", response_model=ProfileResponse, tags=["Profiles"])
def get_profile(
    current_user: User = Depends(get_current_user),
    db: Prisma = Depends(get_db)
):
    profile = db.profile.find_unique(where={"userId": current_user.id})
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    return profile

# Loan prediction and application routes


@app.post("/loans/predict", response_model=LoanPredictionResponse, tags=["Loans"])
def predict_loan_eligibility(loan: LoanDto):
    if model is None:
        raise HTTPException(status_code=503, detail="Model not available")

    # Get original prediction for the requested amount
    loan_data = process_loan_data_for_prediction(loan)
    prediction_proba = model.predict_proba(loan_data)
    # Probability of the positive class
    original_score = prediction_proba[0][1]
    eligible = original_score >= 0.5

    # Find the maximum eligible amount and use the new logic
    max_eligible_amount, orig_score = find_maximum_eligible_amount(loan, loan.loanAmount)

    # Explanation logic
    if eligible:
        if max_eligible_amount > loan.loanAmount:
            explanation = f"Congratulations! You are eligible for the requested loan of XAF {loan.loanAmount*1000:,.0f}. You are also eligible for loans up to XAF {max_eligible_amount*1000:,.0f}."
        else:
            explanation = f"Congratulations! You are eligible for the requested loan of XAF {loan.loanAmount*1000:,.0f}."
    elif max_eligible_amount > 0:
        explanation = f"You are {orig_score*100:.2f}% eligible for the requested loan of XAF {loan.loanAmount*1000:,.0f}. However, you are 100% eligible for loans up to XAF {max_eligible_amount*1000:,.0f}."
    else:
        explanation = f"Unfortunately, you are not eligible for the requested loan of XAF {loan.loanAmount*1000:,.0f} based on the current criteria. Please consider improving your financial profile or applying for a smaller amount."

    return LoanPredictionResponse(
        eligible=eligible,
        originalScore=float(orig_score),
        eligibilityPercentage=round(orig_score*100, 2),
        maxEligibleAmount=max_eligible_amount,
        requestedAmount=loan.loanAmount,
        explanation=explanation
    )

# LEGACY LOAN ENDPOINTS - COMMENTED OUT FOR CREDIT SCORING MIGRATION
# These endpoints should be removed or updated to use the new CreditAssessment model

# @app.post("/loans/apply", response_model=LoanApplicationResponse, tags=["Loans"])
# def create_loan_application(
#     loan: LoanApplicationCreate,
#     current_user: User = Depends(get_current_user),
#     db: Prisma = Depends(get_db)
# ):
#     # First, get the prediction from the model
#     prediction_response = predict_loan_eligibility(loan)

#     # Create loan application record
#     loan_data: LoanApplicationCreateInput = {
#         "scoreduserId": current_user.id,
#         "amount": loan.loanAmount,
#         "term": loan.loanTerm,
#         "gender": loan.gender,
#         "maritalStatus": loan.maritalStatus,
#         "dependents": loan.dependents,
#         "education": loan.education,
#         "employmentStatus": loan.employmentStatus,
#         "income": loan.income,
#         "coApplicantIncome": loan.coApplicantIncome,
#         "creditHistory": loan.creditHistory,
#         "propertyArea": loan.propertyArea,
#         "score": prediction_response.score,
#         "eligible": prediction_response.eligible,
#         "decisionStatus": DecisionStatus.PENDING,
#     }

#     created_application = db.loanapplication.create(data=loan_data)
#     return created_application

# @app.get("/loans/applications", response_model=List[LoanApplicationResponse], tags=["Loans"])
# def get_user_loan_applications(
#     current_user: User = Depends(get_current_user),
#     db: Prisma = Depends(get_db)
# ):
#     # Get all applications initiated by the user
#     applications = db.loanapplication.find_many(
#         where={"scoreduserId": current_user.id}
#     )
#     return applications

# @app.get("/loans/scoring", response_model=List[LoanApplicationResponse], tags=["Loans"])
# def get_pending_loan_applications(
#     current_user: User = Depends(get_current_user),
#     db: Prisma = Depends(get_db)
# ):
#     # Get all applications that need scoring (pending decision)
#     applications = db.loanapplication.find_many(
#         where={"decisionStatus": DecisionStatus.PENDING}
#     )
#     return applications

# @app.get("/loans/scored", response_model=List[LoanApplicationResponse], tags=["Loans"])
# def get_scored_loan_applications(
#     current_user: User = Depends(get_current_user),
#     db: Prisma = Depends(get_db)
# ):
#     # Get all applications scored by the current user
#     applications = db.loanapplication.find_many(
#         where={"scorerId": current_user.id}
#     )
#     return applications

# @app.put("/loans/{loan_id}", response_model=LoanApplicationResponse, tags=["Loans"])
# def update_loan_application(
#     loan_id: str,
#     loan_update: LoanApplicationUpdate,
#     current_user: User = Depends(get_current_user),
#     db: Prisma = Depends(get_db)
# ):
#     # Check if loan application exists
#     loan_application = db.loanapplication.find_unique(where={"id": loan_id})
#     if not loan_application:
#         raise HTTPException(status_code=404, detail="Loan application not found")

#     # If this is a decision update, set the scorer
#     update_data = loan_update.model_dump(exclude_unset=True)
#     if "decisionStatus" in update_data and loan_application.scorerId is None:
#         update_data["scorerId"] = current_user.id

#     # Cast to LoanApplicationUpdateInput type
#     update_data_typed: LoanApplicationUpdateInput = update_data #type: ignore


#     # Update the application
#     updated_application = db.loanapplication.update(
#         where={"id": loan_id},
#         data=update_data_typed
#     )
#     return updated_application

# @app.get("/loans/{loan_id}", response_model=LoanApplicationResponse, tags=["Loans"])
# def get_loan_application(
#     loan_id: str,
#     current_user: User = Depends(get_current_user),
#     db: Prisma = Depends(get_db)
# ):
#     loan_application = db.loanapplication.find_unique(where={"id": loan_id})
#     if not loan_application:
#         raise HTTPException(status_code=404, detail="Loan application not found")

#     # Check if user has permission to view this application
#     if (loan_application.scoreduserId != current_user.id and
#         loan_application.scorerId != current_user.id):
#         raise HTTPException(status_code=403, detail="Not authorized to view this application")

#     return loan_application

# Credit Scoring Endpoints
@app.post("/scoring/save", response_model=CreditAssessmentResponse, tags=["Credit Scoring"])
def save_credit_score(
    credit_assessment: CreditAssessmentCreate,
    current_user: User = Depends(get_current_user),
    db: Prisma = Depends(get_db)
):
    """Save a credit assessment result"""
    print(credit_assessment, "this is the credit assessment data")
    # First, get the prediction from the model
    # prediction_response = predict_loan_eligibility(credit_assessment)

    # Create credit assessment record
    assessment_data: CreditAssessmentCreateInput = {
        "scorerId": current_user.id,
        "scoreduserId": credit_assessment.scoreduserId,
        "amount": credit_assessment.amount,
        "term": credit_assessment.term,
        "gender": credit_assessment.gender,
        "maritalStatus": credit_assessment.maritalStatus,
        "dependents": credit_assessment.dependents,
        "education": credit_assessment.education,
        "employmentStatus": credit_assessment.employmentStatus,
        "income": credit_assessment.income,
        "coApplicantIncome": credit_assessment.coApplicantIncome,
        "creditHistory": credit_assessment.creditHistory,
        "propertyArea": credit_assessment.propertyArea,
        "score": credit_assessment.score,
        "eligible": credit_assessment.eligible,
        # "decisionStatus": DecisionStatus.PENDING,
        "decisionStatus": credit_assessment.decisionStatus,
        "awardedAmount": credit_assessment.awardedAmount,
        "dueDate": credit_assessment.dueDate,
        "notes": credit_assessment.notes
    }

    created_assessment = db.creditassessment.create(data=assessment_data)

    # Convert to response format
    return CreditAssessmentResponse(
        id=created_assessment.id,
        scoreduserId=created_assessment.scoreduserId,
        scorerId=created_assessment.scorerId,
        # scoredUserId=None,  # Not applicable in current schema
        # scoredUserName="",
        # scoredUserEmail="",
        # scorerName="",
        amount=created_assessment.amount,
        term=created_assessment.term,
        gender=created_assessment.gender,
        maritalStatus=created_assessment.maritalStatus,
        dependents=created_assessment.dependents,
        education=created_assessment.education,
        employmentStatus=created_assessment.employmentStatus,
        income=created_assessment.income,
        coApplicantIncome=created_assessment.coApplicantIncome,
        creditHistory=created_assessment.creditHistory,
        propertyArea=created_assessment.propertyArea,
        score=created_assessment.score,
        eligible=created_assessment.eligible,
        decisionStatus=created_assessment.decisionStatus,
        awardedAmount=created_assessment.awardedAmount,
        dueDate=created_assessment.dueDate,
        outcomeStatus=created_assessment.outcomeStatus,
        notes=created_assessment.notes,
        createdAt=created_assessment.createdAt,
        updatedAt=created_assessment.updatedAt,
        scoreData={
            "eligible": created_assessment.eligible,
            "score": created_assessment.score,
            "explanation": f"Credit score: {created_assessment.score:.2%}" if created_assessment.score else "No score available"
        }
    )


@app.get("/scoring/my-scores", response_model=List[CreditAssessmentResponse], tags=["Credit Scoring"])
def get_my_scores(
    current_user: User = Depends(get_current_user),
    db: Prisma = Depends(get_db)
):
    """Get all credit assessments initiated by the current user"""
    assessments = db.creditassessment.find_many(
        where={"scorerId": current_user.id}
    )

    # Convert to response format
    response_list = []
    for assessment in assessments:
        response_list.append(CreditAssessmentResponse(
            id=assessment.id,
            scoreduserId=assessment.scoreduserId,
            scorerId=assessment.scorerId,
            # scoredUserId=None,
            # scoredUserName="",
            # scoredUserEmail="",
            # scorerName="",
            amount=assessment.amount,
            term=assessment.term,
            gender=assessment.gender,
            maritalStatus=assessment.maritalStatus,
            dependents=assessment.dependents,
            education=assessment.education,
            employmentStatus=assessment.employmentStatus,
            income=assessment.income,
            coApplicantIncome=assessment.coApplicantIncome,
            creditHistory=assessment.creditHistory,
            propertyArea=assessment.propertyArea,
            score=assessment.score,
            eligible=assessment.eligible,
            decisionStatus=assessment.decisionStatus,
            awardedAmount=assessment.awardedAmount,
            dueDate=assessment.dueDate,
            outcomeStatus=assessment.outcomeStatus,
            notes=assessment.notes,
            createdAt=assessment.createdAt,
            updatedAt=assessment.updatedAt,
            scoreData={
                "eligible": assessment.eligible,
                "score": assessment.score,
                "explanation": f"Credit score: {assessment.score:.2%}" if assessment.score else "No score available"
            }
        ))

    return response_list


@app.get("/scoring/scores-on-me", response_model=List[CreditAssessmentResponse], tags=["Credit Scoring"])
def get_scores_on_me(
    current_user: User = Depends(get_current_user),
    db: Prisma = Depends(get_db)
):
    """Get all credit assessments performed on the current user (scores where current user was scored by others)"""
    # Note: In current schema, there's no explicit "scoredUserId" field
    # This endpoint will return assessments where the current user is the scorer for now
    assessments = db.creditassessment.find_many(
        where={"scoreduserId": current_user.id}
    )

    # Convert to response format
    response_list = []
    for assessment in assessments:
        response_list.append(CreditAssessmentResponse(
            id=assessment.id,
            scoreduserId=assessment.scoreduserId,
            scorerId=assessment.scorerId,
            # scoredUserId=None,
            # scoredUserName="",
            # scoredUserEmail="",
            # scorerName="",
            amount=assessment.amount,
            term=assessment.term,
            gender=assessment.gender,
            maritalStatus=assessment.maritalStatus,
            dependents=assessment.dependents,
            education=assessment.education,
            employmentStatus=assessment.employmentStatus,
            income=assessment.income,
            coApplicantIncome=assessment.coApplicantIncome,
            creditHistory=assessment.creditHistory,
            propertyArea=assessment.propertyArea,
            score=assessment.score,
            eligible=assessment.eligible,
            decisionStatus=assessment.decisionStatus,
            awardedAmount=assessment.awardedAmount,
            dueDate=assessment.dueDate,
            outcomeStatus=assessment.outcomeStatus,
            notes=assessment.notes,
            createdAt=assessment.createdAt,
            updatedAt=assessment.updatedAt,
            scoreData={
                "eligible": assessment.eligible,
                "score": assessment.score,
                "explanation": f"Credit score: {assessment.score:.2%}" if assessment.score else "No score available"
            }
        ))

    return response_list


@app.put("/scoring/{scoreId}/status", response_model=CreditAssessmentResponse, tags=["Credit Scoring"])
def update_score_status(
    scoreId: str,
    score_update: CreditAssessmentUpdate,
    current_user: User = Depends(get_current_user),
    db: Prisma = Depends(get_db)
):
    """Update the status of a credit assessment"""
    # Check if assessment exists
    assessment = db.creditassessment.find_unique(where={"id": scoreId})
    if not assessment:
        raise HTTPException(
            status_code=404, detail="Credit assessment not found")

    # Check permissions - only scoreduser can update for now
    if assessment.scorerId != current_user.id and assessment.scoreduserId != current_user.id:
        raise HTTPException(
            status_code=403, detail="Not authorized to update this assessment")

    # Prepare update data
    update_data = score_update.model_dump(exclude_unset=True)

    # If this is a decision update, set the scorer
    if "decisionStatus" in update_data and assessment.scorerId is None:
        update_data["scorerId"] = current_user.id

    update_data_typed: CreditAssessmentUpdateInput = update_data  # type: ignore
    # Update the assessment
    updated_assessment = db.creditassessment.update(
        where={"id": scoreId},
        data=update_data_typed
    )

    if not updated_assessment:
        raise HTTPException(
            status_code=500, detail="Failed to update credit assessment")

    return CreditAssessmentResponse(
        id=updated_assessment.id,
        scoreduserId=updated_assessment.scoreduserId,
        scorerId=updated_assessment.scorerId,
        # scoredUserId=None,
        # scoredUserName="",
        # scoredUserEmail="",
        # scorerName="",
        amount=updated_assessment.amount,
        term=updated_assessment.term,
        gender=updated_assessment.gender,
        maritalStatus=updated_assessment.maritalStatus,
        dependents=updated_assessment.dependents,
        education=updated_assessment.education,
        employmentStatus=updated_assessment.employmentStatus,
        income=updated_assessment.income,
        coApplicantIncome=updated_assessment.coApplicantIncome,
        creditHistory=updated_assessment.creditHistory,
        propertyArea=updated_assessment.propertyArea,
        score=updated_assessment.score,
        eligible=updated_assessment.eligible,
        decisionStatus=updated_assessment.decisionStatus,
        awardedAmount=updated_assessment.awardedAmount,
        dueDate=updated_assessment.dueDate,
        outcomeStatus=updated_assessment.outcomeStatus,
        notes=updated_assessment.notes,
        createdAt=updated_assessment.createdAt,
        updatedAt=updated_assessment.updatedAt,
        scoreData={
            "eligible": updated_assessment.eligible,
            "score": updated_assessment.score,
            "explanation": f"Credit score: {updated_assessment.score:.2%}" if updated_assessment.score else "No score available"
        }
    )


@app.get("/scoring/pending", response_model=List[CreditAssessmentResponse], tags=["Credit Scoring"])
def get_pending_scores(
    current_user: User = Depends(get_current_user),
    db: Prisma = Depends(get_db)
):
    """Get all pending credit assessments"""
    assessments = db.creditassessment.find_many(
        where={"decisionStatus": DecisionStatus.PENDING}
    )

    # Convert to response format
    response_list = []
    for assessment in assessments:
        response_list.append(CreditAssessmentResponse(
            id=assessment.id,
            scoreduserId=assessment.scoreduserId,
            scorerId=assessment.scorerId,
            # scoredUserId=None,
            # scoredUserName="",
            # scoredUserEmail="",
            # scorerName="",
            amount=assessment.amount,
            term=assessment.term,
            gender=assessment.gender,
            maritalStatus=assessment.maritalStatus,
            dependents=assessment.dependents,
            education=assessment.education,
            employmentStatus=assessment.employmentStatus,
            income=assessment.income,
            coApplicantIncome=assessment.coApplicantIncome,
            creditHistory=assessment.creditHistory,
            propertyArea=assessment.propertyArea,
            score=assessment.score,
            eligible=assessment.eligible,
            decisionStatus=assessment.decisionStatus,
            awardedAmount=assessment.awardedAmount,
            dueDate=assessment.dueDate,
            outcomeStatus=assessment.outcomeStatus,
            notes=assessment.notes,
            createdAt=assessment.createdAt,
            updatedAt=assessment.updatedAt,
            scoreData={
                "eligible": assessment.eligible,
                "score": assessment.score,
                "explanation": f"Credit score: {assessment.score:.2%}" if assessment.score else "No score available"
            }
        ))

    return response_list


@app.get("/scoring/completed", response_model=List[CreditAssessmentResponse], tags=["Credit Scoring"])
def get_completed_scores(
    current_user: User = Depends(get_current_user),
    db: Prisma = Depends(get_db)
):
    """Get all completed credit assessments"""
    assessments = db.creditassessment.find_many(
        where={
            "OR": [
                {"decisionStatus": DecisionStatus.AWARDED},
                {"decisionStatus": DecisionStatus.DECLINED}
            ]
        }
    )

    # Convert to response format
    response_list = []
    for assessment in assessments:
        response_list.append(CreditAssessmentResponse(
            id=assessment.id,
            scoreduserId=assessment.scoreduserId,
            scorerId=assessment.scorerId,
            # scoredUserId=None,
            # scoredUserName="",
            # scoredUserEmail="",
            # scorerName="",
            amount=assessment.amount,
            term=assessment.term,
            gender=assessment.gender,
            maritalStatus=assessment.maritalStatus,
            dependents=assessment.dependents,
            education=assessment.education,
            employmentStatus=assessment.employmentStatus,
            income=assessment.income,
            coApplicantIncome=assessment.coApplicantIncome,
            creditHistory=assessment.creditHistory,
            propertyArea=assessment.propertyArea,
            score=assessment.score,
            eligible=assessment.eligible,
            decisionStatus=assessment.decisionStatus,
            awardedAmount=assessment.awardedAmount,
            dueDate=assessment.dueDate,
            outcomeStatus=assessment.outcomeStatus,
            notes=assessment.notes,
            createdAt=assessment.createdAt,
            updatedAt=assessment.updatedAt,
            scoreData={
                "eligible": assessment.eligible,
                "score": assessment.score,
                "explanation": f"Credit score: {assessment.score:.2%}" if assessment.score else "No score available"
            }
        ))

    return response_list


@app.get("/scoring/{scoreId}", response_model=CreditAssessmentResponse, tags=["Credit Scoring"])
def get_score_by_id(
    scoreId: str,
    current_user: User = Depends(get_current_user),
    db: Prisma = Depends(get_db)
):
    """Get a specific credit assessment by ID"""
    assessment = db.creditassessment.find_unique(where={"id": scoreId})

    if not assessment:
        raise HTTPException(
            status_code=404, detail="Credit assessment not found")

    # Check if user has permission to view this assessment
    if (assessment.scoreduserId != current_user.id and
            assessment.scorerId != current_user.id):
        raise HTTPException(
            status_code=403, detail="Not authorized to view this assessment")

    return CreditAssessmentResponse(
        id=assessment.id,
        scoreduserId=assessment.scoreduserId,
        scorerId=assessment.scorerId,
        amount=assessment.amount,
        term=assessment.term,
        gender=assessment.gender,
        maritalStatus=assessment.maritalStatus,
        dependents=assessment.dependents,
        education=assessment.education,
        employmentStatus=assessment.employmentStatus,
        income=assessment.income,
        coApplicantIncome=assessment.coApplicantIncome,
        creditHistory=assessment.creditHistory,
        propertyArea=assessment.propertyArea,
        score=assessment.score,
        eligible=assessment.eligible,
        decisionStatus=assessment.decisionStatus,
        awardedAmount=assessment.awardedAmount,
        dueDate=assessment.dueDate,
        outcomeStatus=assessment.outcomeStatus,
        notes=assessment.notes,
        createdAt=assessment.createdAt,
        updatedAt=assessment.updatedAt,
        scoreData={
            "eligible": assessment.eligible,
            "score": assessment.score,
            "explanation": f"Credit score: {assessment.score:.2%}" if assessment.score else "No score available"
        }
    )


@app.delete("/scoring/{scoreId}", tags=["Credit Scoring"])
def delete_score(
    scoreId: str,
    current_user: User = Depends(get_current_user),
    db: Prisma = Depends(get_db)
):
    """Delete a credit assessment"""
    # Check if assessment exists
    assessment = db.creditassessment.find_unique(where={"id": scoreId})
    if not assessment:
        raise HTTPException(
            status_code=404, detail="Credit assessment not found")

    # Check if user has permission to delete - only scoreduser can delete
    if assessment.scoreduserId != current_user.id:
        raise HTTPException(
            status_code=403, detail="Not authorized to delete this assessment")
      # Delete the assessment
    db.creditassessment.delete(where={"id": scoreId})

    return {"message": "Credit assessment deleted successfully"}

# Dashboard statistics endpoint


@app.get("/dashboard/stats", response_model=DashboardStats, tags=["Dashboard"])
def get_dashboard_stats(
    current_user: User = Depends(get_current_user),
    db: Prisma = Depends(get_db)
):
    """Get dashboard statistics for the current user"""

    # Total scores performed by current user
    total_scores_performed = db.creditassessment.count(
        where={"scorerId": current_user.id}
    )

    # Total scores received by current user (where they were scored)
    total_scores_received = db.creditassessment.count(
        where={"scoreduserId": current_user.id}
    )

    # Total loans tracked (assessments with awarded status)
    total_loans_tracked = db.creditassessment.count(
        where={
            "OR": [
                {"scorerId": current_user.id},
                {"scoreduserId": current_user.id}
            ],
            "decisionStatus": DecisionStatus.AWARDED
        }
    )

    # Successful repayments (loans with PAID outcome)
    successful_repayments = db.creditassessment.count(
        where={
            "OR": [
                {"scorerId": current_user.id},
                {"scoreduserId": current_user.id}
            ],
            "outcomeStatus": LoanOutcome.PAID
        }
    )

    # Pending loans (assessments with PENDING decision status)
    pending_loans = db.creditassessment.count(
        where={
            "OR": [
                {"scorerId": current_user.id},
                {"scoreduserId": current_user.id}
            ],
            "decisionStatus": DecisionStatus.PENDING
        }
    )
    # Recent scores (last 5 assessments initiated by current user)
    recent_assessments = db.creditassessment.find_many(
        where={"scorerId": current_user.id},
        order={"createdAt": "desc"},
        take=5,
        include={
            "scoreduser": {
                "include": {
                    "profile": True
                }
            }
        }
    )

    # Convert to recent scores format
    recent_scores = []
    for assessment in recent_assessments:
        # Get scored user name from profile or email
        scored_user_name = "Unknown User"
        if assessment.scoreduser:
            if assessment.scoreduser.profile and assessment.scoreduser.profile.fullName:
                scored_user_name = assessment.scoreduser.profile.fullName
            else:
                scored_user_name = assessment.scoreduser.email.split('@')[0]

        # Check if loan was taken (has awarded status)
        loan_taken = assessment.decisionStatus == DecisionStatus.AWARDED

        recent_scores.append(RecentScore(
            id=assessment.id,
            scoredUserName=scored_user_name,
            score=assessment.score or 0.0,
            date=assessment.createdAt.isoformat(),
            decisionStatus=assessment.decisionStatus
        ))

    return DashboardStats(
        totalScoresPerformed=total_scores_performed,
        totalScoresReceived=total_scores_received,
        totalLoansTracked=total_loans_tracked,
        successfulRepayments=successful_repayments,
        pendingLoans=pending_loans,
        recentScores=recent_scores
    )

# Health check endpoint


@app.get("/health", tags=["Health"])
def health_check():
    return {"status": "healthy", "model_loaded": model is not None}
