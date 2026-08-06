"""Tests for /api/cart endpoints."""
from tests.conftest import auth_headers


def test_get_cart_empty(client, regular_user):
    headers = auth_headers(client, "alice@test.com", "alicepass")
    resp = client.get("/api/cart", headers=headers)
    assert resp.status_code == 200
    assert resp.json() == []


def test_add_to_cart(client, regular_user, product):
    headers = auth_headers(client, "alice@test.com", "alicepass")
    resp = client.post("/api/cart",
                       json={"product_id": product.id, "quantity": 2}, headers=headers)
    assert resp.status_code == 201
    assert resp.json()["quantity"] == 2
    assert resp.json()["product"]["name"] == "Test Laptop"


def test_add_same_product_increases_quantity(client, regular_user, product):
    headers = auth_headers(client, "alice@test.com", "alicepass")
    client.post("/api/cart", json={"product_id": product.id, "quantity": 1}, headers=headers)
    client.post("/api/cart", json={"product_id": product.id, "quantity": 2}, headers=headers)
    resp = client.get("/api/cart", headers=headers)
    assert resp.json()[0]["quantity"] == 3


def test_add_to_cart_exceeds_stock(client, regular_user, product):
    headers = auth_headers(client, "alice@test.com", "alicepass")
    resp = client.post("/api/cart",
                       json={"product_id": product.id, "quantity": 999}, headers=headers)
    assert resp.status_code == 400
    assert "stock" in resp.json()["detail"].lower()


def test_add_nonexistent_product(client, regular_user):
    headers = auth_headers(client, "alice@test.com", "alicepass")
    resp = client.post("/api/cart", json={"product_id": 9999, "quantity": 1}, headers=headers)
    assert resp.status_code == 404


def test_update_cart_item(client, regular_user, product):
    headers = auth_headers(client, "alice@test.com", "alicepass")
    add = client.post("/api/cart", json={"product_id": product.id, "quantity": 1}, headers=headers)
    item_id = add.json()["id"]
    resp = client.put(f"/api/cart/{item_id}", json={"quantity": 5}, headers=headers)
    assert resp.status_code == 200
    assert resp.json()["quantity"] == 5


def test_remove_cart_item(client, regular_user, product):
    headers = auth_headers(client, "alice@test.com", "alicepass")
    add = client.post("/api/cart", json={"product_id": product.id, "quantity": 1}, headers=headers)
    item_id = add.json()["id"]
    resp = client.delete(f"/api/cart/{item_id}", headers=headers)
    assert resp.status_code == 204
    assert client.get("/api/cart", headers=headers).json() == []


def test_clear_cart(client, regular_user, product):
    headers = auth_headers(client, "alice@test.com", "alicepass")
    client.post("/api/cart", json={"product_id": product.id, "quantity": 1}, headers=headers)
    resp = client.delete("/api/cart", headers=headers)
    assert resp.status_code == 204
    assert client.get("/api/cart", headers=headers).json() == []


def test_cart_requires_auth(client):
    resp = client.get("/api/cart")
    assert resp.status_code == 401
