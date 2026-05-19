# ScoreSure

AI-powered credit scoring and loan eligibility platform. ScoreSure lets loan officers assess borrower creditworthiness using a machine-learning model, save scoring decisions, and track loan outcomes over time.

Built as a full-stack web application with a React frontend and a FastAPI backend backed by PostgreSQL.

---

## Table of contents

- [Features](#features)
- [Architecture](#architecture)
- [Tech stack](#tech-stack)
- [Project structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Getting started](#getting-started)
  - [Backend setup](#backend-setup)
  - [Frontend setup](#frontend-setup)
  - [Seed demo data](#seed-demo-data)
- [Demo credentials](#demo-credentials)
- [Environment variables](#environment-variables)
- [API reference](#api-reference)
- [Credit scoring model](#credit-scoring-model)
- [Database schema](#database-schema)
- [Docker](#docker)
- [Development scripts](#development-scripts)

---

## Features

### Public
- **Landing page** — product overview and call-to-action
- **Quick Score** — run an anonymous eligibility check without an account
- **Register / Login** — JWT-based authentication

### Authenticated users
- **Dashboard** — scores performed, loans tracked, repayments, and recent activity
- **Profile management** — demographic, financial, and credit-history fields with automatic credit-history assessment
- **Perform Scoring** — search registered users and score them against a requested loan amount
- **My Scores** — view and manage credit assessments you have initiated
- **Score History** — browse completed assessments and loan outcomes (paid, in progress, defaulted)
- **Score Details** — inspect individual assessment results and update decision status
- **Dark mode** — theme toggle across the application

### Backend
- REST API with OpenAPI/Swagger docs at `/docs`
- scikit-learn loan eligibility predictor with max-eligible-amount calculation
- Rule-based credit history scoring from banking behaviour and loan purpose
- PostgreSQL persistence via Prisma ORM

---

## Architecture

```mermaid
flowchart LR
  subgraph client [React Client]
    UI[Vite + React + Tailwind]
  end

  subgraph server [FastAPI Server]
    API[REST API]
    ML[scikit-learn Model]
    Auth[JWT + bcrypt]
  end

  DB[(PostgreSQL)]

  UI -->|HTTP / JWT| API
  API --> ML
  API --> Auth
  API --> DB
```

**Typical scoring flow**

1. A loan officer searches for a registered borrower.
2. The officer enters loan amount, term, and financial details.
3. The backend runs the ML model via `POST /loans/predict`.
4. The officer reviews eligibility and saves the assessment via `POST /scoring/save`.
5. Decision status and loan outcomes are updated over time via `PUT /scoring/{id}/status`.

---

## Tech stack

| Layer | Technologies |
|-------|-------------|
| Frontend | React 19, TypeScript, Vite, Tailwind CSS 4, React Router, Axios, Headless UI, Heroicons |
| Backend | Python 3.10+, FastAPI, Uvicorn, Pydantic, PyJWT, Passlib/bcrypt |
| Database | PostgreSQL, Prisma (Python client) |
| ML | scikit-learn, pandas, numpy, joblib |

---

## Project structure

```
AI_loan_eligibility_platform/
├── README.md
├── loan_eligibility_client/          # React frontend
│   ├── src/
│   │   ├── components/               # Navbar, Footer, LoadingOverlay, …
│   │   ├── context/                  # Auth, Theme, Data, Toast providers
│   │   ├── pages/
│   │   │   ├── auth/                 # Login, Register
│   │   │   ├── profile/              # Profile view & create
│   │   │   └── scoring/              # QuickScore, ScoreUser, MyScores, …
│   │   └── services/api.ts           # Axios API client
│   └── .env                          # VITE_API_URL
│
└── loan_eligibility_server/          # FastAPI backend
    ├── main.py                       # API entry point
    ├── loanModel.py                  # Pydantic request/response models
    ├── seed_demo_data.py             # Demo data seeder
    ├── dev.ps1                       # Local dev helper (Windows)
    ├── prisma/schema.prisma          # Database schema
    ├── requirements.txt
    ├── Dockerfile
    └── .env                          # DATABASE_URL
```

---

## Prerequisites

- **Node.js** 18+ and npm
- **Python** 3.10+
- **PostgreSQL** database (local or hosted, e.g. Neon)
- **Git**

---

## Getting started

### Backend setup

```powershell
cd loan_eligibility_server

# Create and activate a virtual environment
python -m venv venv
.\venv\Scripts\Activate.ps1

# Install dependencies
pip install -r requirements.txt

# Configure environment (see Environment variables below)
# Create .env with your DATABASE_URL

# Apply database migrations and generate Prisma client
prisma migrate dev
prisma generate

# Place the trained model file in the server root (see Credit scoring model)
# Expected path: ./loan_elig_predictor_new

# Start the API
uvicorn main:app --reload
```

The API runs at **http://127.0.0.1:8000**. Interactive docs: **http://127.0.0.1:8000/docs**.

On Windows you can also use the helper script:

```powershell
.\dev.ps1
```

### Frontend setup

```powershell
cd loan_eligibility_client

npm install

# Create .env with VITE_API_URL pointing to the backend
# VITE_API_URL=http://localhost:8000

npm run dev
```

The client runs at **http://localhost:5173**.

### Seed demo data

With the API running, populate the database with demo users, profiles, and credit assessments:

```powershell
cd loan_eligibility_server
.\venv\Scripts\python.exe seed_demo_data.py
```

The seeder is **idempotent** — re-running it skips accounts and assessments that already exist. See [Demo credentials](#demo-credentials) below for login details.

---

## Demo credentials

All demo accounts share the same password:

```
Password: Demo123!
```

### Recommended starting account

| Email | Role | Name |
|-------|------|------|
| `demo.lender@scoresure.app` | Loan officer | Marie Kamga |

Use this account to explore **Dashboard**, **Perform Scoring**, **My Scores**, and **Score History** with pre-populated data.

### Secondary scorer

| Email | Role | Name |
|-------|------|------|
| `demo.analyst@scoresure.app` | Analyst | Thomas Ndongo |

### Borrower accounts

Search for these users when performing scoring:

| Email | Name |
|-------|------|
| `marie.nguema@demo.scoresure.app` | Marie Nguema |
| `paul.mvondo@demo.scoresure.app` | Paul Mvondo |
| `fatou.diallo@demo.scoresure.app` | Fatou Diallo |
| `jean.kouam@demo.scoresure.app` | Jean Kouam |
| `grace.efouba@demo.scoresure.app` | Grace Efouba |
| `samuel.oben@demo.scoresure.app` | Samuel Oben |
| `claire.mbah@demo.scoresure.app` | Claire Mbah |
| `eric.fotso@demo.scoresure.app` | Eric Fotso |

The seeded dataset includes **18 credit assessments** spanning:

| Decision status | Outcome | Purpose |
|----------------|---------|---------|
| Pending | — | Assessments awaiting review |
| Awarded | — | Approved, not yet taken |
| Declined | — | Rejected applications |
| Awarded & taken | In progress | Active loans |
| Awarded & taken | Paid | Successfully repaid |
| Awarded & taken | Defaulted | Missed repayments |

---

## Environment variables

### Backend — `loan_eligibility_server/.env`

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string (Prisma format) |
| `HEALTH_DB_MAX_ATTEMPTS` | Optional. DB ping retries on `/health` (default `5`) |
| `HEALTH_DB_RETRY_DELAY_SEC` | Optional. Seconds between retries (default `2.0`) |
| `DB_CONNECT_TIMEOUT_SEC` | Optional. Max seconds to wait for a DB connection (default `10`) |
| `REQUEST_TIMEOUT_SEC` | Optional. Max seconds per HTTP request on the API (default `60`) |

Example:

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/DATABASE?sslmode=require"
```

### Frontend — `loan_eligibility_client/.env`

| Variable | Description |
|----------|-------------|
| `VITE_API_URL` | Base URL of the FastAPI backend |
| `VITE_API_TIMEOUT_MS` | Optional. Axios request timeout in ms (default `30000`) |

Example:

```env
VITE_API_URL=http://localhost:8000
```

---

## API reference

Full interactive documentation is available at `/docs` when the server is running.

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/auth/register` | — | Register a new user |
| `POST` | `/auth/token` | — | Login (OAuth2 password form) |
| `GET` | `/users/me` | JWT | Current user info |
| `GET` | `/users/search?q=` | JWT | Search users by email or name |
| `GET/POST/PUT` | `/users/profile` | JWT | Read, create, or update profile |
| `POST` | `/loans/predict` | — | Run ML eligibility prediction |
| `POST` | `/scoring/save` | JWT | Save a credit assessment |
| `GET` | `/scoring/my-scores` | JWT | Assessments initiated by you |
| `GET` | `/scoring/scores-on-me` | JWT | Assessments where you were scored |
| `GET` | `/scoring/pending` | JWT | Pending assessments |
| `GET` | `/scoring/completed` | JWT | Completed assessments |
| `GET` | `/scoring/{scoreId}` | JWT | Single assessment detail |
| `PUT` | `/scoring/{scoreId}/status` | JWT | Update decision / outcome |
| `DELETE` | `/scoring/{scoreId}` | JWT | Delete an assessment |
| `GET` | `/dashboard/stats` | JWT | Dashboard statistics |
| `GET` | `/health` | — | Health check (DB ping with cold-start retries; `503` if DB down) |

---

## Credit scoring model

The backend loads a pre-trained scikit-learn model from `./loan_elig_predictor_new` at startup (via joblib). Model files are gitignored — you must supply the trained artifact locally or in your deployment environment.

**Input features** include gender, marital status, dependents, education, employment status, applicant/co-applicant income, loan amount, loan term, property area, and a derived credit-history flag.

**Outputs** from `POST /loans/predict`:

- Eligibility boolean (probability ≥ 0.5)
- Original score (probability)
- Maximum eligible loan amount
- Human-readable explanation

Credit history on profiles is also computed server-side from `bankTransactions`, `lendingHistory`, and `loanPurpose` using a weighted scoring rule in `assess_credit_history()`.

---

## Database schema

Managed by Prisma. Core models:

| Model | Purpose |
|-------|---------|
| `User` | Authentication (email + hashed password) |
| `Profile` | Extended borrower demographics and financial data |
| `CreditAssessment` | Scoring records linking scorer ↔ scored user, with decision and outcome tracking |

Key enums: `Gender`, `MaritalStatus`, `Education`, `EmploymentStatus`, `PropertyArea`, `DecisionStatus` (`PENDING`, `AWARDED`, `DECLINED`, `AWARDED_AND_TAKEN`), `LoanOutcome` (`IN_PROGRESS`, `PAID`, `DEFAULTED`).

Apply schema changes:

```powershell
cd loan_eligibility_server
prisma migrate dev --name describe_your_change
```

---

## Docker

A Dockerfile is provided for the backend:

```dockerfile
# Builds Python 3.10 + Node (for Prisma CLI), exposes port 10000
CMD ["uvicorn", "main:app", "--host=0.0.0.0", "--port=10000"]
```

Build and run:

```bash
cd loan_eligibility_server
docker build -t scoresure-api .
docker run -p 10000:10000 --env-file .env scoresure-api
```

Ensure `DATABASE_URL`, the ML model file, and any required migrations are available in the container environment.

---

## Development scripts

| Script | Location | Description |
|--------|----------|-------------|
| `npm run dev` | `loan_eligibility_client` | Start Vite dev server |
| `npm run build` | `loan_eligibility_client` | Production build |
| `uvicorn main:app --reload` | `loan_eligibility_server` | Start API with hot reload |
| `.\dev.ps1` | `loan_eligibility_server` | Generate Prisma client + start API (Windows) |
| `python seed_demo_data.py` | `loan_eligibility_server` | Seed demo users and assessments |
| `python verify_endpoints.py` | `loan_eligibility_server` | Smoke-test all API endpoints |
| `prisma migrate dev` | `loan_eligibility_server` | Apply migrations |
| `prisma generate` | `loan_eligibility_server` | Regenerate Prisma Python client |


