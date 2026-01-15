"""
CRM API Backend Tests
Tests for Chelsea Flynn CRM system endpoints
- Authentication endpoints (401 for unauthenticated)
- Contact management endpoints
- Todo endpoints
- Dashboard endpoints
- Pipeline stages
"""

import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

class TestHealthAndBasicAPI:
    """Test basic API health and root endpoints"""
    
    def test_api_root(self):
        """Test API root endpoint returns success"""
        response = requests.get(f"{BASE_URL}/api/")
        assert response.status_code == 200
        data = response.json()
        assert "message" in data
        assert data["message"] == "Chelsea Flynn API"
        print(f"✓ API root endpoint working: {data}")


class TestCRMAuthEndpoints:
    """Test CRM authentication endpoints - should return 401 for unauthenticated requests"""
    
    def test_auth_me_unauthenticated(self):
        """GET /api/crm/auth/me should return 401 without auth"""
        response = requests.get(f"{BASE_URL}/api/crm/auth/me")
        assert response.status_code == 401
        data = response.json()
        assert "detail" in data
        print(f"✓ /api/crm/auth/me returns 401 for unauthenticated: {data}")
    
    def test_logout_unauthenticated(self):
        """POST /api/crm/auth/logout should work even without auth"""
        response = requests.post(f"{BASE_URL}/api/crm/auth/logout")
        # Logout should work even without auth (just clears cookie)
        assert response.status_code in [200, 401]
        print(f"✓ /api/crm/auth/logout status: {response.status_code}")


class TestCRMContactsEndpoints:
    """Test CRM contacts endpoints - should return 401 for unauthenticated requests"""
    
    def test_get_contacts_unauthenticated(self):
        """GET /api/crm/contacts should return 401 without auth"""
        response = requests.get(f"{BASE_URL}/api/crm/contacts")
        assert response.status_code == 401
        data = response.json()
        assert "detail" in data
        print(f"✓ GET /api/crm/contacts returns 401: {data}")
    
    def test_create_contact_unauthenticated(self):
        """POST /api/crm/contacts should return 401 without auth"""
        contact_data = {
            "first_name": "TEST_John",
            "last_name": "Doe",
            "email": "test@example.com"
        }
        response = requests.post(f"{BASE_URL}/api/crm/contacts", json=contact_data)
        assert response.status_code == 401
        data = response.json()
        assert "detail" in data
        print(f"✓ POST /api/crm/contacts returns 401: {data}")
    
    def test_get_single_contact_unauthenticated(self):
        """GET /api/crm/contacts/{id} should return 401 without auth"""
        response = requests.get(f"{BASE_URL}/api/crm/contacts/test-id-123")
        assert response.status_code == 401
        data = response.json()
        assert "detail" in data
        print(f"✓ GET /api/crm/contacts/{{id}} returns 401: {data}")
    
    def test_update_contact_unauthenticated(self):
        """PUT /api/crm/contacts/{id} should return 401 without auth"""
        response = requests.put(f"{BASE_URL}/api/crm/contacts/test-id-123", json={"first_name": "Updated"})
        assert response.status_code == 401
        data = response.json()
        assert "detail" in data
        print(f"✓ PUT /api/crm/contacts/{{id}} returns 401: {data}")
    
    def test_delete_contact_unauthenticated(self):
        """DELETE /api/crm/contacts/{id} should return 401 without auth"""
        response = requests.delete(f"{BASE_URL}/api/crm/contacts/test-id-123")
        assert response.status_code == 401
        data = response.json()
        assert "detail" in data
        print(f"✓ DELETE /api/crm/contacts/{{id}} returns 401: {data}")


class TestCRMTodosEndpoints:
    """Test CRM todos endpoints - should return 401 for unauthenticated requests"""
    
    def test_get_todos_unauthenticated(self):
        """GET /api/crm/todos should return 401 without auth"""
        response = requests.get(f"{BASE_URL}/api/crm/todos")
        assert response.status_code == 401
        data = response.json()
        assert "detail" in data
        print(f"✓ GET /api/crm/todos returns 401: {data}")
    
    def test_create_todo_unauthenticated(self):
        """POST /api/crm/todos should return 401 without auth"""
        todo_data = {
            "title": "TEST_Task",
            "description": "Test description"
        }
        response = requests.post(f"{BASE_URL}/api/crm/todos", json=todo_data)
        assert response.status_code == 401
        data = response.json()
        assert "detail" in data
        print(f"✓ POST /api/crm/todos returns 401: {data}")
    
    def test_update_todo_unauthenticated(self):
        """PUT /api/crm/todos/{id} should return 401 without auth"""
        response = requests.put(f"{BASE_URL}/api/crm/todos/test-id-123", json={"completed": True})
        assert response.status_code == 401
        data = response.json()
        assert "detail" in data
        print(f"✓ PUT /api/crm/todos/{{id}} returns 401: {data}")
    
    def test_delete_todo_unauthenticated(self):
        """DELETE /api/crm/todos/{id} should return 401 without auth"""
        response = requests.delete(f"{BASE_URL}/api/crm/todos/test-id-123")
        assert response.status_code == 401
        data = response.json()
        assert "detail" in data
        print(f"✓ DELETE /api/crm/todos/{{id}} returns 401: {data}")


class TestCRMDashboardEndpoints:
    """Test CRM dashboard endpoints - should return 401 for unauthenticated requests"""
    
    def test_get_dashboard_unauthenticated(self):
        """GET /api/crm/dashboard should return 401 without auth"""
        response = requests.get(f"{BASE_URL}/api/crm/dashboard")
        assert response.status_code == 401
        data = response.json()
        assert "detail" in data
        print(f"✓ GET /api/crm/dashboard returns 401: {data}")
    
    def test_get_pipeline_stages_unauthenticated(self):
        """GET /api/crm/pipeline-stages should return 401 without auth"""
        response = requests.get(f"{BASE_URL}/api/crm/pipeline-stages")
        assert response.status_code == 401
        data = response.json()
        assert "detail" in data
        print(f"✓ GET /api/crm/pipeline-stages returns 401: {data}")


class TestCRMActivitiesEndpoints:
    """Test CRM activities endpoints - should return 401 for unauthenticated requests"""
    
    def test_get_contact_activities_unauthenticated(self):
        """GET /api/crm/contacts/{id}/activities should return 401 without auth"""
        response = requests.get(f"{BASE_URL}/api/crm/contacts/test-id-123/activities")
        assert response.status_code == 401
        data = response.json()
        assert "detail" in data
        print(f"✓ GET /api/crm/contacts/{{id}}/activities returns 401: {data}")
    
    def test_create_activity_unauthenticated(self):
        """POST /api/crm/activities should return 401 without auth"""
        activity_data = {
            "contact_id": "test-id-123",
            "activity_type": "note",
            "description": "Test activity"
        }
        response = requests.post(f"{BASE_URL}/api/crm/activities", json=activity_data)
        assert response.status_code == 401
        data = response.json()
        assert "detail" in data
        print(f"✓ POST /api/crm/activities returns 401: {data}")


class TestCRMEmailEndpoints:
    """Test CRM email endpoints - should return 401 for unauthenticated requests"""
    
    def test_get_email_templates_unauthenticated(self):
        """GET /api/crm/email-templates should return 401 without auth"""
        response = requests.get(f"{BASE_URL}/api/crm/email-templates")
        assert response.status_code == 401
        data = response.json()
        assert "detail" in data
        print(f"✓ GET /api/crm/email-templates returns 401: {data}")
    
    def test_send_email_unauthenticated(self):
        """POST /api/crm/send-email should return 401 without auth"""
        email_data = {
            "to_email": "test@example.com",
            "subject": "Test",
            "body": "Test body"
        }
        response = requests.post(f"{BASE_URL}/api/crm/send-email", json=email_data)
        assert response.status_code == 401
        data = response.json()
        assert "detail" in data
        print(f"✓ POST /api/crm/send-email returns 401: {data}")


class TestCRMInvoiceAndAgreementEndpoints:
    """Test CRM invoice and agreement endpoints - should return 401 for unauthenticated requests"""
    
    def test_get_invoices_unauthenticated(self):
        """GET /api/crm/invoices should return 401 without auth"""
        response = requests.get(f"{BASE_URL}/api/crm/invoices")
        assert response.status_code == 401
        data = response.json()
        assert "detail" in data
        print(f"✓ GET /api/crm/invoices returns 401: {data}")
    
    def test_get_agreements_unauthenticated(self):
        """GET /api/crm/agreements should return 401 without auth"""
        response = requests.get(f"{BASE_URL}/api/crm/agreements")
        assert response.status_code == 401
        data = response.json()
        assert "detail" in data
        print(f"✓ GET /api/crm/agreements returns 401: {data}")


class TestExistingPublicEndpoints:
    """Test existing public endpoints (contact form, booking) still work"""
    
    def test_contact_form_endpoint(self):
        """POST /api/contact should work without auth"""
        contact_data = {
            "name": "TEST_Contact",
            "email": "test@example.com",
            "message": "Test message from automated testing"
        }
        response = requests.post(f"{BASE_URL}/api/contact", json=contact_data)
        assert response.status_code == 200
        data = response.json()
        assert "id" in data
        assert data["name"] == "TEST_Contact"
        print(f"✓ POST /api/contact works: {data['id']}")
    
    def test_booking_endpoint(self):
        """POST /api/booking should work without auth"""
        booking_data = {
            "name": "TEST_Booking",
            "email": "test@example.com",
            "booking_type": "Speaking Engagement",
            "message": "Test booking from automated testing"
        }
        response = requests.post(f"{BASE_URL}/api/booking", json=booking_data)
        assert response.status_code == 200
        data = response.json()
        assert "id" in data
        assert data["name"] == "TEST_Booking"
        print(f"✓ POST /api/booking works: {data['id']}")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
