"""Tests for /api/auth/* endpoints."""
import pytest
from tests.conftest import auth_headers


def test_register_success(client):
    resp = client.post("/api/auth/register", json={
        "name": "Bob", "email": "bob@test.com", "password": "secret123"
    })
    assert resp.status_code == 201
    data = resp.json()
    assert data["user"]["email"] == "bob@test.com"
    assert data["user"]["role"] == "customer"
    assert "access_token" in data


def test_register_duplicate_email(client):
    payload = {"name": "Bob", "email": "bob@test.com", "password": "secret123"}
    client.post("/api/auth/register", json=payload)
    resp = client.post("/api/auth/register", json=payload)
    assert resp.status_code == 400
    assert "already registered" in resp.json()["detail"].lower()


def test_register_short_password(client):
    resp = client.post("/api/auth/register", json={
        "name": "Bob", "email": "bob@test.com", "password": "abc"
    })
    assert resp.status_code == 422


def test_login_success(client, regular_user):
    resp = client.post("/api/auth/login",
                       json={"email": "alice@test.com", "password": "alicepass"})
    assert resp.status_code == 200
    assert "access_token" in resp.json()


def test_login_wrong_password(client, regular_user):
    resp = client.post("/api/auth/login",
                       json={"email": "alice@test.com", "password": "wrong"})
    assert resp.status_code == 401


def test_login_unknown_email(client):
    resp = client.post("/api/auth/login",
                       json={"email": "nobody@test.com", "password": "pass"})
    assert resp.status_code == 401


def test_get_me(client, regular_user):
    headers = auth_headers(client, "alice@test.com", "alicepass")
    resp = client.get("/api/auth/me", headers=headers)
    assert resp.status_code == 200
    assert resp.json()["email"] == "alice@test.com"


def test_get_me_unauthenticated(client):
    resp = client.get("/api/auth/me")
    assert resp.status_code == 401


def test_update_me(client, regular_user):
    headers = auth_headers(client, "alice@test.com", "alicepass")
    resp = client.put("/api/auth/me", json={"name": "Alice Updated", "phone": "1234567890"},
                      headers=headers)
    assert resp.status_code == 200
    assert resp.json()["name"] == "Alice Updated"


def test_change_password(client, regular_user):
    headers = auth_headers(client, "alice@test.com", "alicepass")
    resp = client.put("/api/auth/me/password",
                      json={"current_password": "alicepass", "new_password": "newpass123"},
                      headers=headers)
    assert resp.status_code == 200
    # Should be able to login with new password
    resp2 = client.post("/api/auth/login",
                        json={"email": "alice@test.com", "password": "newpass123"})
    assert resp2.status_code == 200


def test_change_password_wrong_current(client, regular_user):
    headers = auth_headers(client, "alice@test.com", "alicepass")
    resp = client.put("/api/auth/me/password",
                      json={"current_password": "wrongpass", "new_password": "newpass123"},
                      headers=headers)
    assert resp.status_code == 400
