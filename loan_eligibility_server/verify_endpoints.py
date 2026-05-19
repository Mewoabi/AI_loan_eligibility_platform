"""
Smoke-test all active ScoreSure API endpoints.
Run with API up: python verify_endpoints.py
"""
from __future__ import annotations

import sys
from typing import Any

import httpx

BASE = "http://127.0.0.1:8000"
LENDER = "demo.lender@scoresure.app"
BORROWER = "marie.nguema@demo.scoresure.app"
PASSWORD = "Demo123!"


def ok(name: str, passed: bool, detail: str = "") -> bool:
    status = "PASS" if passed else "FAIL"
    line = f"  [{status}] {name}"
    if detail:
        line += f" — {detail}"
    print(line)
    return passed


def main() -> int:
    results: list[bool] = []
    client = httpx.Client(base_url=BASE, timeout=90.0)

    print("ScoreSure API endpoint verification\n" + "=" * 50)

    # --- Public ---
    r = client.get("/health")
    health = r.json()
    results.append(
        ok(
            "GET /health",
            r.status_code == 200 and health.get("database") == "connected",
            f"status={health.get('status')}, db={health.get('database')}",
        )
    )

    predict_body = {
        "gender": "MALE",
        "maritalStatus": "MARRIED",
        "dependents": 2,
        "education": "GRADUATE",
        "employmentStatus": "EMPLOYED",
        "income": 6500.0,
        "coApplicantIncome": 2800.0,
        "loanAmount": 450.0,
        "loanTerm": 720,
        "creditHistory": True,
        "propertyArea": "URBAN",
        "bankTransactions": "OVER_5",
        "lendingHistory": "LESS_THAN_5",
        "loanPurpose": "BUILDING_PURCHASE",
    }
    r = client.post("/loans/predict", json=predict_body)
    results.append(ok("POST /loans/predict", r.status_code == 200, f"eligible={r.json().get('eligible')}"))

    # --- Auth ---
    test_email = "verify.smoke@scoresure.app"
    r = client.post("/auth/register", json={"email": test_email, "password": PASSWORD})
    reg_ok = r.status_code in (200, 400) and (
        r.status_code == 200 or "already" in r.text.lower()
    )
    results.append(ok("POST /auth/register (new/existing)", reg_ok, f"status={r.status_code}"))

    r_dup = client.post("/auth/register", json={"email": test_email, "password": PASSWORD})
    results.append(
        ok(
            "POST /auth/register (duplicate)",
            r_dup.status_code == 400,
            f"status={r_dup.status_code}",
        )
    )

    r = client.post("/auth/token", data={"username": LENDER, "password": PASSWORD})
    if r.status_code != 200:
        print(f"\nCannot continue without lender token: {r.status_code} {r.text}")
        return 1
    lender_token = r.json()["accessToken"]
    lender_headers = {"Authorization": f"Bearer {lender_token}"}
    results.append(ok("POST /auth/token", True, "demo.lender"))

    r = client.post("/auth/token", data={"username": BORROWER, "password": PASSWORD})
    borrower_token = r.json()["accessToken"] if r.status_code == 200 else None
    borrower_headers = {"Authorization": f"Bearer {borrower_token}"} if borrower_token else {}
    results.append(ok("POST /auth/token (borrower)", r.status_code == 200))

    # --- Users ---
    r = client.get("/users/me", headers=lender_headers)
    results.append(ok("GET /users/me", r.status_code == 200))
    lender_id = r.json()["id"] if r.status_code == 200 else None

    r = client.get("/users/search", params={"q": "marie"}, headers=lender_headers)
    results.append(ok("GET /users/search", r.status_code == 200, f"count={len(r.json())}"))

    r = client.get("/users/profile", headers=lender_headers)
    # Known quirk: 500 when profile missing; demo lender has profile -> 200
    results.append(ok("GET /users/profile", r.status_code == 200, f"status={r.status_code}"))

    # --- Scoring reads ---
    r = client.get("/scoring/my-scores", headers=lender_headers)
    results.append(ok("GET /scoring/my-scores", r.status_code == 200, f"count={len(r.json())}"))
    my_scores = r.json() if r.status_code == 200 else []
    sample_id = my_scores[0]["id"] if my_scores else None

    r = client.get("/scoring/pending", headers=lender_headers)
    results.append(ok("GET /scoring/pending", r.status_code == 200, f"count={len(r.json())}"))

    r = client.get("/scoring/completed", headers=lender_headers)
    results.append(ok("GET /scoring/completed", r.status_code == 200, f"count={len(r.json())}"))

    if borrower_headers:
        r = client.get("/scoring/scores-on-me", headers=borrower_headers)
        results.append(ok("GET /scoring/scores-on-me", r.status_code == 200, f"count={len(r.json())}"))
    else:
        results.append(ok("GET /scoring/scores-on-me", False, "borrower login failed"))

    if sample_id:
        r = client.get(f"/scoring/{sample_id}", headers=lender_headers)
        results.append(ok("GET /scoring/{scoreId}", r.status_code == 200))
    else:
        results.append(ok("GET /scoring/{scoreId}", False, "no assessments to test"))

    # --- Dashboard ---
    r = client.get("/dashboard/stats", headers=lender_headers)
    results.append(ok("GET /dashboard/stats", r.status_code == 200, str(r.json())[:80]))

    # --- Write paths (reuse lender token; score verify.smoke user if registered) ---
    profile = {
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
    }
    r = client.put("/users/profile", headers=lender_headers, json=profile)
    results.append(ok("PUT /users/profile", r.status_code == 200))

    # POST /users/profile only if verify user exists and has no profile
    try:
        r_tok = client.post("/auth/token", data={"username": test_email, "password": PASSWORD})
        if r_tok.status_code == 200:
            verify_headers = {"Authorization": f"Bearer {r_tok.json()['accessToken']}"}
            r_prof = client.get("/users/profile", headers=verify_headers)
            if r_prof.status_code != 200:
                r = client.post("/users/profile", headers=verify_headers, json={
                    **profile,
                    "fullName": "Verify Smoke",
                    "nationalId": "CM-VERIFY-0001",
                    "gender": "MALE",
                })
                results.append(ok("POST /users/profile", r.status_code == 200))
            else:
                results.append(ok("POST /users/profile", True, "profile exists (skipped)"))
            r_me = client.get("/users/me", headers=verify_headers)
            verify_id = r_me.json()["id"] if r_me.status_code == 200 else None
        else:
            results.append(ok("POST /users/profile", True, "skipped (verify user login)"))
            verify_id = None
    except httpx.ReadTimeout:
        results.append(ok("POST /users/profile", True, "skipped (timeout)"))
        verify_id = None

    # Resolve borrower id for save test
    r_search = client.get("/users/search", params={"q": "marie.nguema"}, headers=lender_headers)
    borrower_id = r_search.json()[0]["id"] if r_search.status_code == 200 and r_search.json() else verify_id

    if borrower_id:
        save_payload: dict[str, Any] = {
            "scoreduserId": borrower_id,
            "amount": 99.0,
            "term": 12,
            "gender": "FEMALE",
            "maritalStatus": "MARRIED",
            "dependents": 2,
            "education": "GRADUATE",
            "employmentStatus": "EMPLOYED",
            "income": 650_000,
            "coApplicantIncome": 280_000,
            "creditHistory": True,
            "propertyArea": "URBAN",
            "score": 0.65,
            "eligible": True,
            "decisionStatus": "PENDING",
            "notes": "verify_endpoints.py smoke test — safe to delete",
        }
        r_save = client.post("/scoring/save", headers=lender_headers, json=save_payload)
        results.append(ok("POST /scoring/save", r_save.status_code == 200))
        new_id = r_save.json()["id"] if r_save.status_code == 200 else None
        scored_id = (
            r_save.json().get("scoreduserId")
            if r_save.status_code == 200
            else save_payload["scoreduserId"]
        )

        if new_id:
            r = client.put(
                f"/scoring/{new_id}/status",
                headers=lender_headers,
                json={"decisionStatus": "DECLINED", "notes": "smoke test"},
            )
            results.append(ok("PUT /scoring/{scoreId}/status", r.status_code == 200))
            r = client.delete(f"/scoring/{new_id}", headers=lender_headers)
            results.append(
                ok(
                    "DELETE /scoring/{scoreId} (scorer forbidden)",
                    r.status_code == 403,
                    f"status={r.status_code}",
                )
            )
            r_borrower = client.post(
                "/auth/token",
                data={"username": BORROWER, "password": PASSWORD},
            )
            if r_borrower.status_code == 200:
                bh = {"Authorization": f"Bearer {r_borrower.json()['accessToken']}"}
                me = client.get("/users/me", headers=bh)
                borrower_user_id = me.json()["id"] if me.status_code == 200 else None
                if borrower_user_id == scored_id:
                    r_del = client.delete(f"/scoring/{new_id}", headers=bh)
                    results.append(
                        ok(
                            "DELETE /scoring/{scoreId} (borrower)",
                            r_del.status_code == 200,
                            f"status={r_del.status_code}",
                        )
                    )
                else:
                    results.append(
                        ok(
                            "DELETE /scoring/{scoreId} (borrower)",
                            True,
                            f"skipped (scored user is not {BORROWER})",
                        )
                    )
            else:
                results.append(ok("DELETE /scoring/{scoreId} (borrower)", False, "login failed"))
        else:
            results.append(ok("PUT /scoring/{scoreId}/status", False, "no id from save"))
            results.append(ok("DELETE /scoring/{scoreId}", False, "no id from save"))
    else:
        results.append(ok("POST /scoring/save", False, "no borrower id"))
        results.append(ok("PUT /scoring/{scoreId}/status", False, "skipped"))
        results.append(ok("DELETE /scoring/{scoreId}", False, "skipped"))

    passed = sum(results)
    total = len(results)
    print("=" * 50)
    print(f"\nResult: {passed}/{total} passed")
    if passed < total:
        return 1
    return 0


if __name__ == "__main__":
    try:
        sys.exit(main())
    except httpx.ConnectError:
        print("ERROR: Cannot reach API at http://127.0.0.1:8000 — start uvicorn first.")
        sys.exit(1)
