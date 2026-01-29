"""
Tests for the High School Management System API
"""

from fastapi.testclient import TestClient
from src.app import app, activities

client = TestClient(app)


def test_get_activities():
    """Test getting all activities"""
    response = client.get("/activities")
    assert response.status_code == 200
    data = response.json()
    assert "Chess Club" in data
    assert "Programming Class" in data
    assert "Gym Class" in data


def test_signup_for_activity():
    """Test signing up for an activity"""
    # Reset activities to a known state
    activities["Chess Club"]["participants"] = ["michael@mergington.edu", "daniel@mergington.edu"]
    
    response = client.post(
        "/activities/Chess Club/signup?email=test@mergington.edu"
    )
    assert response.status_code == 200
    data = response.json()
    assert "Signed up test@mergington.edu for Chess Club" in data["message"]
    assert "test@mergington.edu" in activities["Chess Club"]["participants"]


def test_signup_for_nonexistent_activity():
    """Test signing up for a non-existent activity"""
    response = client.post(
        "/activities/NonExistent/signup?email=test@mergington.edu"
    )
    assert response.status_code == 404
    data = response.json()
    assert data["detail"] == "Activity not found"


def test_unregister_from_activity():
    """Test unregistering from an activity"""
    # Reset activities to a known state and add a test user
    activities["Chess Club"]["participants"] = ["michael@mergington.edu", "daniel@mergington.edu", "test@mergington.edu"]
    
    response = client.delete(
        "/activities/Chess Club/signup?email=test@mergington.edu"
    )
    assert response.status_code == 200
    data = response.json()
    assert "Unregistered test@mergington.edu from Chess Club" in data["message"]
    assert "test@mergington.edu" not in activities["Chess Club"]["participants"]


def test_unregister_from_nonexistent_activity():
    """Test unregistering from a non-existent activity"""
    response = client.delete(
        "/activities/NonExistent/signup?email=test@mergington.edu"
    )
    assert response.status_code == 404
    data = response.json()
    assert data["detail"] == "Activity not found"


def test_unregister_not_registered_student():
    """Test unregistering a student who is not registered"""
    # Reset activities to a known state
    activities["Chess Club"]["participants"] = ["michael@mergington.edu", "daniel@mergington.edu"]
    
    response = client.delete(
        "/activities/Chess Club/signup?email=notregistered@mergington.edu"
    )
    assert response.status_code == 404
    data = response.json()
    assert data["detail"] == "Student not registered for this activity"
