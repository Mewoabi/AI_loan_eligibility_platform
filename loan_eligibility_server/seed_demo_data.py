"""
Seed ScoreSure with demo users, profiles, and credit assessments.

Run from loan_eligibility_server (with venv active and API running):
    python seed_demo_data.py

Demo login (all accounts use the same password):
    Password: Demo123!

Primary demo accounts:
    demo.lender@scoresure.app   — loan officer (scores others, rich dashboard)
    demo.analyst@scoresure.app  — secondary scorer

Borrower accounts (searchable when performing scoring):
    marie.nguema@demo.scoresure.app
    paul.mvondo@demo.scoresure.app
    fatou.diallo@demo.scoresure.app
    jean.kouam@demo.scoresure.app
    grace.efouba@demo.scoresure.app
    samuel.oben@demo.scoresure.app
    claire.mbah@demo.scoresure.app
    eric.fotso@demo.scoresure.app
"""

from __future__ import annotations

import sys
from datetime import datetime, timedelta, timezone
from typing import Any

import httpx

API_BASE = "http://127.0.0.1:8000"
PASSWORD = "Demo123!"

# Monthly income values are stored in XAF (Cameroon).
# Loan amounts for the ML model are in thousands of XAF (e.g. 500 = 500,000 XAF).

DEMO_USERS: list[dict[str, Any]] = [
    {
        "email": "demo.lender@scoresure.app",
        "profile": {
            "fullName": "Marie Kamga",
            "nationalId": "CM-DEMO-0001",
            "gender": "FEMALE",
            "maritalStatus": "MARRIED",
            "dependents": 2,
            "education": "GRADUATE",
            "employmentStatus": "EMPLOYED",
            "income": 850_000,
            "coApplicantIncome": 420_000,
            "bankTransactions": "OVER_5",
            "lendingHistory": "LESS_THAN_5",
            "loanPurpose": "BUSINESS_INVESTMENT",
            "propertyArea": "URBAN",
        },
    },
    {
        "email": "demo.analyst@scoresure.app",
        "profile": {
            "fullName": "Thomas Ndongo",
            "nationalId": "CM-DEMO-0002",
            "gender": "MALE",
            "maritalStatus": "MARRIED",
            "dependents": 1,
            "education": "GRADUATE",
            "employmentStatus": "EMPLOYED",
            "income": 720_000,
            "coApplicantIncome": 310_000,
            "bankTransactions": "OVER_5",
            "lendingHistory": "LESS_THAN_5",
            "loanPurpose": "EDUCATION",
            "propertyArea": "URBAN",
        },
    },
    {
        "email": "marie.nguema@demo.scoresure.app",
        "profile": {
            "fullName": "Marie Nguema",
            "nationalId": "CM-DEMO-1001",
            "gender": "FEMALE",
            "maritalStatus": "MARRIED",
            "dependents": 3,
            "education": "GRADUATE",
            "employmentStatus": "EMPLOYED",
            "income": 650_000,
            "coApplicantIncome": 280_000,
            "bankTransactions": "OVER_5",
            "lendingHistory": "LESS_THAN_5",
            "loanPurpose": "BUILDING_PURCHASE",
            "propertyArea": "URBAN",
        },
    },
    {
        "email": "paul.mvondo@demo.scoresure.app",
        "profile": {
            "fullName": "Paul Mvondo",
            "nationalId": "CM-DEMO-1002",
            "gender": "MALE",
            "maritalStatus": "SINGLE",
            "dependents": 0,
            "education": "GRADUATE",
            "employmentStatus": "EMPLOYED",
            "income": 420_000,
            "coApplicantIncome": 0,
            "bankTransactions": "LESS_THAN_5",
            "lendingHistory": "NONE",
            "loanPurpose": "CAR_PURCHASE",
            "propertyArea": "SEMIURBAN",
        },
    },
    {
        "email": "fatou.diallo@demo.scoresure.app",
        "profile": {
            "fullName": "Fatou Diallo",
            "nationalId": "CM-DEMO-1003",
            "gender": "FEMALE",
            "maritalStatus": "MARRIED",
            "dependents": 2,
            "education": "GRADUATE",
            "employmentStatus": "SELF_EMPLOYED",
            "income": 540_000,
            "coApplicantIncome": 190_000,
            "bankTransactions": "OVER_5",
            "lendingHistory": "LESS_THAN_5",
            "loanPurpose": "BUSINESS_INVESTMENT",
            "propertyArea": "URBAN",
        },
    },
    {
        "email": "jean.kouam@demo.scoresure.app",
        "profile": {
            "fullName": "Jean Kouam",
            "nationalId": "CM-DEMO-1004",
            "gender": "MALE",
            "maritalStatus": "DIVORCED",
            "dependents": 1,
            "education": "NOT_GRADUATE",
            "employmentStatus": "UNEMPLOYED",
            "income": 95_000,
            "coApplicantIncome": 0,
            "bankTransactions": "NONE",
            "lendingHistory": "OVER_5",
            "loanPurpose": "RENTS_AND_BILLS",
            "propertyArea": "RURAL",
        },
    },
    {
        "email": "grace.efouba@demo.scoresure.app",
        "profile": {
            "fullName": "Grace Efouba",
            "nationalId": "CM-DEMO-1005",
            "gender": "FEMALE",
            "maritalStatus": "SINGLE",
            "dependents": 0,
            "education": "GRADUATE",
            "employmentStatus": "SELF_EMPLOYED",
            "income": 380_000,
            "coApplicantIncome": 0,
            "bankTransactions": "LESS_THAN_5",
            "lendingHistory": "NONE",
            "loanPurpose": "BUSINESS_INVESTMENT",
            "propertyArea": "SEMIURBAN",
        },
    },
    {
        "email": "samuel.oben@demo.scoresure.app",
        "profile": {
            "fullName": "Samuel Oben",
            "nationalId": "CM-DEMO-1006",
            "gender": "MALE",
            "maritalStatus": "SINGLE",
            "dependents": 0,
            "education": "NOT_GRADUATE",
            "employmentStatus": "STUDENT",
            "income": 120_000,
            "coApplicantIncome": 80_000,
            "bankTransactions": "LESS_THAN_5",
            "lendingHistory": "NONE",
            "loanPurpose": "EDUCATION",
            "propertyArea": "URBAN",
        },
    },
    {
        "email": "claire.mbah@demo.scoresure.app",
        "profile": {
            "fullName": "Claire Mbah",
            "nationalId": "CM-DEMO-1007",
            "gender": "FEMALE",
            "maritalStatus": "WIDOWED",
            "dependents": 4,
            "education": "NOT_GRADUATE",
            "employmentStatus": "EMPLOYED",
            "income": 210_000,
            "coApplicantIncome": 0,
            "bankTransactions": "LESS_THAN_5",
            "lendingHistory": "LESS_THAN_5",
            "loanPurpose": "MEDICAL_EMERGENCY",
            "propertyArea": "RURAL",
        },
    },
    {
        "email": "eric.fotso@demo.scoresure.app",
        "profile": {
            "fullName": "Eric Fotso",
            "nationalId": "CM-DEMO-1008",
            "gender": "MALE",
            "maritalStatus": "MARRIED",
            "dependents": 2,
            "education": "GRADUATE",
            "employmentStatus": "EMPLOYED",
            "income": 1_200_000,
            "coApplicantIncome": 600_000,
            "bankTransactions": "OVER_5",
            "lendingHistory": "LESS_THAN_5",
            "loanPurpose": "BUILDING_PURCHASE",
            "propertyArea": "URBAN",
        },
    },
]

# Each assessment: who scores whom, loan params, and final workflow state.
ASSESSMENT_PLANS: list[dict[str, Any]] = [
    {
        "scorer": "demo.lender@scoresure.app",
        "borrower": "marie.nguema@demo.scoresure.app",
        "amount_thousands": 450,
        "term_months": 24,
        "decisionStatus": "AWARDED_AND_TAKEN",
        "outcomeStatus": "PAID",
        "notes": "Home renovation loan — repaid on schedule.",
        "days_ago": 120,
    },
    {
        "scorer": "demo.lender@scoresure.app",
        "borrower": "marie.nguema@demo.scoresure.app",
        "amount_thousands": 300,
        "term_months": 18,
        "decisionStatus": "PENDING",
        "notes": "Follow-up business expansion request under review.",
        "days_ago": 5,
    },
    {
        "scorer": "demo.analyst@scoresure.app",
        "borrower": "marie.nguema@demo.scoresure.app",
        "amount_thousands": 250,
        "term_months": 12,
        "decisionStatus": "AWARDED",
        "notes": "Pre-approved equipment financing.",
        "days_ago": 14,
    },
    {
        "scorer": "demo.lender@scoresure.app",
        "borrower": "paul.mvondo@demo.scoresure.app",
        "amount_thousands": 180,
        "term_months": 36,
        "decisionStatus": "AWARDED_AND_TAKEN",
        "outcomeStatus": "IN_PROGRESS",
        "notes": "Vehicle purchase — monthly repayments ongoing.",
        "days_ago": 45,
    },
    {
        "scorer": "demo.analyst@scoresure.app",
        "borrower": "paul.mvondo@demo.scoresure.app",
        "amount_thousands": 220,
        "term_months": 24,
        "decisionStatus": "DECLINED",
        "notes": "Debt-to-income ratio too high for requested amount.",
        "days_ago": 30,
    },
    {
        "scorer": "demo.lender@scoresure.app",
        "borrower": "fatou.diallo@demo.scoresure.app",
        "amount_thousands": 350,
        "term_months": 24,
        "decisionStatus": "AWARDED_AND_TAKEN",
        "outcomeStatus": "PAID",
        "notes": "Market stall expansion — fully repaid.",
        "days_ago": 90,
    },
    {
        "scorer": "demo.lender@scoresure.app",
        "borrower": "fatou.diallo@demo.scoresure.app",
        "amount_thousands": 500,
        "term_months": 36,
        "decisionStatus": "AWARDED_AND_TAKEN",
        "outcomeStatus": "IN_PROGRESS",
        "notes": "Second location inventory loan.",
        "days_ago": 20,
    },
    {
        "scorer": "demo.analyst@scoresure.app",
        "borrower": "jean.kouam@demo.scoresure.app",
        "amount_thousands": 150,
        "term_months": 12,
        "decisionStatus": "DECLINED",
        "notes": "Insufficient income and poor lending history.",
        "days_ago": 60,
    },
    {
        "scorer": "demo.lender@scoresure.app",
        "borrower": "jean.kouam@demo.scoresure.app",
        "amount_thousands": 80,
        "term_months": 6,
        "decisionStatus": "AWARDED_AND_TAKEN",
        "outcomeStatus": "DEFAULTED",
        "notes": "Micro-loan — missed last three instalments.",
        "days_ago": 75,
    },
    {
        "scorer": "demo.lender@scoresure.app",
        "borrower": "grace.efouba@demo.scoresure.app",
        "amount_thousands": 200,
        "term_months": 18,
        "decisionStatus": "AWARDED_AND_TAKEN",
        "outcomeStatus": "PAID",
        "notes": "Tailoring business starter kit — repaid early.",
        "days_ago": 150,
    },
    {
        "scorer": "demo.analyst@scoresure.app",
        "borrower": "grace.efouba@demo.scoresure.app",
        "amount_thousands": 280,
        "term_months": 24,
        "decisionStatus": "PENDING",
        "notes": "Awaiting additional bank statements.",
        "days_ago": 3,
    },
    {
        "scorer": "demo.lender@scoresure.app",
        "borrower": "samuel.oben@demo.scoresure.app",
        "amount_thousands": 120,
        "term_months": 12,
        "decisionStatus": "AWARDED",
        "notes": "Tuition support — approved pending disbursement.",
        "days_ago": 10,
    },
    {
        "scorer": "demo.analyst@scoresure.app",
        "borrower": "samuel.oben@demo.scoresure.app",
        "amount_thousands": 200,
        "term_months": 24,
        "decisionStatus": "DECLINED",
        "notes": "Student income insufficient for requested amount.",
        "days_ago": 25,
    },
    {
        "scorer": "demo.lender@scoresure.app",
        "borrower": "claire.mbah@demo.scoresure.app",
        "amount_thousands": 100,
        "term_months": 12,
        "decisionStatus": "AWARDED_AND_TAKEN",
        "outcomeStatus": "IN_PROGRESS",
        "notes": "Medical emergency loan — family healthcare costs.",
        "days_ago": 35,
    },
    {
        "scorer": "demo.analyst@scoresure.app",
        "borrower": "claire.mbah@demo.scoresure.app",
        "amount_thousands": 60,
        "term_months": 6,
        "decisionStatus": "AWARDED_AND_TAKEN",
        "outcomeStatus": "PAID",
        "notes": "Short-term medical bridge loan — closed.",
        "days_ago": 100,
    },
    {
        "scorer": "demo.lender@scoresure.app",
        "borrower": "eric.fotso@demo.scoresure.app",
        "amount_thousands": 800,
        "term_months": 48,
        "decisionStatus": "AWARDED_AND_TAKEN",
        "outcomeStatus": "IN_PROGRESS",
        "notes": "Commercial property down-payment financing.",
        "days_ago": 55,
    },
    {
        "scorer": "demo.analyst@scoresure.app",
        "borrower": "eric.fotso@demo.scoresure.app",
        "amount_thousands": 600,
        "term_months": 36,
        "decisionStatus": "AWARDED_AND_TAKEN",
        "outcomeStatus": "PAID",
        "notes": "Prior investment property loan — completed.",
        "days_ago": 200,
    },
    {
        "scorer": "demo.lender@scoresure.app",
        "borrower": "eric.fotso@demo.scoresure.app",
        "amount_thousands": 400,
        "term_months": 24,
        "decisionStatus": "PENDING",
        "notes": "Fleet acquisition proposal pending committee review.",
        "days_ago": 7,
    },
]


def log(message: str) -> None:
    print(message, flush=True)


def register_or_login(client: httpx.Client, email: str) -> str:
    response = client.post(
        "/auth/register",
        json={"email": email, "password": PASSWORD},
    )
    if response.status_code == 200:
        log(f"  Registered {email}")
    elif "already registered" in response.text.lower():
        log(f"  Already registered {email}")
    else:
        response.raise_for_status()

    token_response = client.post(
        "/auth/token",
        data={"username": email, "password": PASSWORD},
    )
    token_response.raise_for_status()
    return token_response.json()["accessToken"]


def assessment_exists(client: httpx.Client, token: str, borrower_id: str, amount: float, notes: str | None) -> bool:
    headers = {"Authorization": f"Bearer {token}"}
    response = client.get("/scoring/my-scores", headers=headers)
    response.raise_for_status()
    for item in response.json():
        if item["scoreduserId"] == borrower_id and item["amount"] == amount and item.get("notes") == notes:
            return True
    return False


def ensure_profile(client: httpx.Client, token: str, profile: dict[str, Any]) -> None:
    headers = {"Authorization": f"Bearer {token}"}
    existing = client.get("/users/profile", headers=headers)
    if existing.status_code == 200:
        log("  Profile already exists")
        return

    created = client.post("/users/profile", headers=headers, json=profile)
    if created.status_code == 400 and "already exists" in created.text.lower():
        log("  Profile already exists")
        return
    created.raise_for_status()
    log(f"  Created profile for {profile['fullName']}")


def predict_score(client: httpx.Client, profile: dict[str, Any], amount_thousands: float, term_months: int) -> dict[str, Any]:
    payload = {
        "gender": profile["gender"],
        "maritalStatus": profile["maritalStatus"],
        "dependents": profile["dependents"],
        "education": profile["education"],
        "employmentStatus": profile["employmentStatus"],
        "income": profile["income"] / 100,
        "coApplicantIncome": profile["coApplicantIncome"] / 100,
        "loanAmount": amount_thousands / 100,
        "loanTerm": (term_months / 12) * 360,
        "creditHistory": True,
        "propertyArea": profile["propertyArea"],
        "bankTransactions": profile["bankTransactions"],
        "lendingHistory": profile["lendingHistory"],
        "loanPurpose": profile["loanPurpose"],
    }
    response = client.post("/loans/predict", json=payload)
    response.raise_for_status()
    return response.json()


def save_assessment(
    client: httpx.Client,
    token: str,
    borrower_id: str,
    profile: dict[str, Any],
    amount_thousands: float,
    term_months: int,
    prediction: dict[str, Any],
    decision_status: str,
    notes: str | None,
) -> str:
    headers = {"Authorization": f"Bearer {token}"}
    payload = {
        "scoreduserId": borrower_id,
        "amount": amount_thousands,
        "term": term_months,
        "gender": profile["gender"],
        "maritalStatus": profile["maritalStatus"],
        "dependents": profile["dependents"],
        "education": profile["education"],
        "employmentStatus": profile["employmentStatus"],
        "income": profile["income"],
        "coApplicantIncome": profile["coApplicantIncome"],
        "creditHistory": prediction["eligible"],
        "propertyArea": profile["propertyArea"],
        "score": prediction["originalScore"],
        "eligible": prediction["eligible"],
        "decisionStatus": decision_status,
        "notes": notes,
    }
    if decision_status in {"AWARDED", "AWARDED_AND_TAKEN"}:
        payload["awardedAmount"] = amount_thousands
    response = client.post("/scoring/save", headers=headers, json=payload)
    response.raise_for_status()
    return response.json()["id"]


def update_assessment(
    client: httpx.Client,
    token: str,
    assessment_id: str,
    *,
    outcome_status: str | None = None,
    due_date: datetime | None = None,
) -> None:
    headers = {"Authorization": f"Bearer {token}"}
    payload: dict[str, Any] = {}
    if outcome_status:
        payload["outcomeStatus"] = outcome_status
    if due_date:
        payload["dueDate"] = due_date.isoformat()
    if not payload:
        return
    response = client.put(f"/scoring/{assessment_id}/status", headers=headers, json=payload)
    response.raise_for_status()


def main() -> int:
    log("ScoreSure demo data seed")
    log(f"API: {API_BASE}")
    log("")

    user_ids: dict[str, str] = {}
    user_profiles: dict[str, dict[str, Any]] = {}
    tokens: dict[str, str] = {}

    with httpx.Client(base_url=API_BASE, timeout=60.0) as client:
        health = client.get("/health")
        health.raise_for_status()

        log("Step 1 - users & profiles")
        for entry in DEMO_USERS:
            email = entry["email"]
            log(f"- {email}")
            token = register_or_login(client, email)
            tokens[email] = token
            ensure_profile(client, token, entry["profile"])

            me = client.get("/users/me", headers={"Authorization": f"Bearer {token}"})
            me.raise_for_status()
            user_ids[email] = me.json()["id"]
            user_profiles[email] = entry["profile"]

        log("")
        log("Step 2 - credit assessments")
        created_count = 0
        for plan in ASSESSMENT_PLANS:
            scorer_email = plan["scorer"]
            borrower_email = plan["borrower"]
            profile = user_profiles[borrower_email]
            amount = plan["amount_thousands"]
            term = plan["term_months"]
            decision = plan["decisionStatus"]

            log(f"- {scorer_email} -> {borrower_email} ({amount}k XAF, {decision})")

            if assessment_exists(client, tokens[scorer_email], user_ids[borrower_email], amount, plan.get("notes")):
                log("  Skipped — already seeded")
                continue

            prediction = predict_score(client, profile, amount, term)
            assessment_id = save_assessment(
                client,
                tokens[scorer_email],
                user_ids[borrower_email],
                profile,
                amount,
                term,
                prediction,
                decision,
                plan.get("notes"),
            )

            outcome = plan.get("outcomeStatus")
            if outcome or decision == "AWARDED_AND_TAKEN":
                due_date = datetime.now(timezone.utc) + timedelta(days=term * 30)
                update_assessment(
                    client,
                    tokens[scorer_email],
                    assessment_id,
                    outcome_status=outcome or "IN_PROGRESS",
                    due_date=due_date if decision == "AWARDED_AND_TAKEN" else None,
                )

            created_count += 1

        stats = client.get(
            "/dashboard/stats",
            headers={"Authorization": f"Bearer {tokens['demo.lender@scoresure.app']}"},
        )
        stats.raise_for_status()
        dashboard = stats.json()

    log("")
    log("Seed complete")
    log(f"  Users: {len(DEMO_USERS)}")
    log(f"  Assessments: {created_count}")
    log(f"  Dashboard (demo.lender): {dashboard['totalScoresPerformed']} scores performed, "
        f"{dashboard['totalLoansTracked']} loans tracked")
    log("")
    log("Login with any demo account — password: Demo123!")
    log("  demo.lender@scoresure.app  (recommended starting point)")
    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except httpx.HTTPError as exc:
        log(f"HTTP error: {exc}")
        if exc.response is not None:
            log(exc.response.text)
        raise SystemExit(1)
