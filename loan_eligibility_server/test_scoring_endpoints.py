#!/usr/bin/env python3
"""
Test script to verify the new scoring endpoints work correctly
"""

import requests
import json
from typing import Optional

BASE_URL = "http://localhost:8000"

class APITester:
    def __init__(self, base_url: str = BASE_URL):
        self.base_url = base_url
        self.token: Optional[str] = None
        self.headers = {}
    
    def register_user(self, email: str, password: str) -> bool:
        """Register a new test user"""
        try:
            response = requests.post(
                f"{self.base_url}/auth/register",
                json={"email": email, "password": password}
            )
            if response.status_code == 200:
                print(f"✅ User {email} registered successfully")
                return True
            else:
                print(f"❌ Failed to register user: {response.text}")
                return False
        except Exception as e:
            print(f"❌ Error registering user: {e}")
            return False
    
    def login(self, email: str, password: str) -> bool:
        """Login and get access token"""
        try:
            response = requests.post(
                f"{self.base_url}/auth/token",
                data={"username": email, "password": password}
            )
            if response.status_code == 200:
                data = response.json()
                self.token = data["accessToken"]
                self.headers = {"Authorization": f"Bearer {self.token}"}
                print(f"✅ Login successful for {email}")
                return True
            else:
                print(f"❌ Login failed: {response.text}")
                return False
        except Exception as e:
            print(f"❌ Error during login: {e}")
            return False
    
    def test_health_check(self) -> bool:
        """Test the health endpoint"""
        try:
            response = requests.get(f"{self.base_url}/health")
            if response.status_code == 200:
                data = response.json()
                print(f"✅ Health check passed: {data}")
                return True
            else:
                print(f"❌ Health check failed: {response.text}")
                return False
        except Exception as e:
            print(f"❌ Error in health check: {e}")
            return False
    
    def test_scoring_save(self) -> Optional[str]:
        """Test saving a credit assessment"""
        try:
            credit_data = {
                "gender": "MALE",
                "maritalStatus": "SINGLE",
                "dependents": 1,
                "education": "GRADUATE",
                "employmentStatus": "EMPLOYED",
                "income": 5000.0,
                "coApplicantIncome": 2000.0,
                "loanAmount": 100000.0,
                "loanTerm": 360,
                "creditHistory": True,
                "propertyArea": "URBAN"
            }
            
            response = requests.post(
                f"{self.base_url}/scoring/save",
                json=credit_data,
                headers=self.headers
            )
            
            if response.status_code == 200:
                data = response.json()
                assessment_id = data["id"]
                print(f"✅ Credit assessment saved successfully: {assessment_id}")
                print(f"   Score: {data.get('score', 'N/A')}")
                print(f"   Eligible: {data.get('eligible', 'N/A')}")
                return assessment_id
            else:
                print(f"❌ Failed to save credit assessment: {response.text}")
                return None
        except Exception as e:
            print(f"❌ Error saving credit assessment: {e}")
            return None
    
    def test_get_my_scores(self) -> bool:
        """Test getting user's initiated scores"""
        try:
            response = requests.get(
                f"{self.base_url}/scoring/my-scores",
                headers=self.headers
            )
            
            if response.status_code == 200:
                data = response.json()
                print(f"✅ Retrieved {len(data)} credit assessments")
                for assessment in data[:2]:  # Show first 2
                    print(f"   ID: {assessment['id']}, Score: {assessment.get('score', 'N/A')}")
                return True
            else:
                print(f"❌ Failed to get my scores: {response.text}")
                return False
        except Exception as e:
            print(f"❌ Error getting my scores: {e}")
            return False
    
    def test_get_score_by_id(self, assessment_id: str) -> bool:
        """Test getting a specific assessment by ID"""
        try:
            response = requests.get(
                f"{self.base_url}/scoring/{assessment_id}",
                headers=self.headers
            )
            
            if response.status_code == 200:
                data = response.json()
                print(f"✅ Retrieved assessment {assessment_id}")
                print(f"   Amount: {data.get('amount', 'N/A')}")
                print(f"   Decision Status: {data.get('decisionStatus', 'N/A')}")
                return True
            else:
                print(f"❌ Failed to get assessment by ID: {response.text}")
                return False
        except Exception as e:
            print(f"❌ Error getting assessment by ID: {e}")
            return False
    
    def test_get_pending_scores(self) -> bool:
        """Test getting pending assessments"""
        try:
            response = requests.get(
                f"{self.base_url}/scoring/pending",
                headers=self.headers
            )
            
            if response.status_code == 200:
                data = response.json()
                print(f"✅ Retrieved {len(data)} pending assessments")
                return True
            else:
                print(f"❌ Failed to get pending scores: {response.text}")
                return False
        except Exception as e:
            print(f"❌ Error getting pending scores: {e}")
            return False

def main():
    """Run the complete test suite"""
    print("🚀 Starting API Testing...")
    print("=" * 50)
    
    tester = APITester()
    
    # Test health check first
    print("\n📋 Testing Health Check...")
    if not tester.test_health_check():
        print("❌ Health check failed, stopping tests")
        return
    
    # Register and login test user
    print("\n👤 Testing Authentication...")
    test_email = "test_scorer@example.com"
    test_password = "testpassword123"
    
    # Try to register (may fail if user exists, that's ok)
    tester.register_user(test_email, test_password)
    
    # Login
    if not tester.login(test_email, test_password):
        print("❌ Login failed, stopping tests")
        return
    
    # Test scoring endpoints
    print("\n🎯 Testing Scoring Endpoints...")
    
    # Save a credit assessment
    assessment_id = tester.test_scoring_save()
    if not assessment_id:
        print("❌ Failed to create assessment, skipping dependent tests")
        return
    
    # Get my scores
    tester.test_get_my_scores()
    
    # Get specific assessment
    tester.test_get_score_by_id(assessment_id)
    
    # Get pending scores
    tester.test_get_pending_scores()
    
    print("\n" + "=" * 50)
    print("✅ API Testing Complete!")

if __name__ == "__main__":
    main()
