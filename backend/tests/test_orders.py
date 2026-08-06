"""Tests for /api/orders endpoints."""
from tests.conftest import auth_headers


def _add_product_to_cart(client, product, headers):
    return client.post("/api/cart",
                       json={"product_id": product.id, "quantity": 1}, headers=headers)


def test_create_order(client, regular_user, product):
    headers = auth_headers(client, "alice@test.com", "alicepass")
    _add_product_to_cart(client, product, headers)
    resp = client.post("/api/orders", json={
        "shipping_address": "123 Main Street, New York, NY 10001",
        "payment_method": "card",
    }, headers=headers)
    assert resp.status_code == 201
    data = resp.json()
    assert data["status"] == "pending"
    assert data["payment_status"] == "pending"
    assert len(data["items"]) == 1
    assert data["items"][0]["product"]["name"] == "Test Laptop"


def test_create_order_clears_cart(client, regular_user, product):
    headers = auth_headers(client, "alice@test.com", "alicepass")
    _add_product_to_cart(client, product, headers)
    client.post("/api/orders", json={
        "shipping_address": "123 Main St, NY 10001", "payment_method": "card"}, headers=headers)
    cart = client.get("/api/cart", headers=headers)
    assert cart.json() == []


def test_create_order_decrements_stock(client, regular_user, product, db):
    headers = auth_headers(client, "alice@test.com", "alicepass")
    original_stock = product.stock_quantity
    _add_product_to_cart(client, product, headers)
    client.post("/api/orders", json={
        "shipping_address": "123 Main St, NY 10001", "payment_method": "card"}, headers=headers)
    db.refresh(product)
    assert product.stock_quantity == original_stock - 1


def test_create_order_empty_cart(client, regular_user):
    headers = auth_headers(client, "alice@test.com", "alicepass")
    resp = client.post("/api/orders", json={
        "shipping_address": "123 Main St, NY 10001", "payment_method": "card"}, headers=headers)
    assert resp.status_code == 400
    assert "empty" in resp.json()["detail"].lower()


def test_list_my_orders(client, regular_user, product):
    headers = auth_headers(client, "alice@test.com", "alicepass")
    _add_product_to_cart(client, product, headers)
    client.post("/api/orders", json={
        "shipping_address": "123 Main St, NY 10001", "payment_method": "card"}, headers=headers)
    resp = client.get("/api/orders", headers=headers)
    assert resp.status_code == 200
    assert len(resp.json()) == 1


def test_get_order_by_id(client, regular_user, product):
    headers = auth_headers(client, "alice@test.com", "alicepass")
    _add_product_to_cart(client, product, headers)
    create = client.post("/api/orders", json={
        "shipping_address": "123 Main St, NY 10001", "payment_method": "card"}, headers=headers)
    order_id = create.json()["id"]
    resp = client.get(f"/api/orders/{order_id}", headers=headers)
    assert resp.status_code == 200
    assert resp.json()["id"] == order_id


def test_cannot_see_other_user_order(client, regular_user, admin_user, product, db):
    import models
    from auth import hash_password
    # Create order as alice
    alice_headers = auth_headers(client, "alice@test.com", "alicepass")
    client.post("/api/cart", json={"product_id": product.id, "quantity": 1}, headers=alice_headers)
    create = client.post("/api/orders", json={
        "shipping_address": "123 Main St, NY 10001", "payment_method": "card"},
        headers=alice_headers)
    order_id = create.json()["id"]
    # Bob tries to see alice's order
    bob = models.User(name="Bob", email="bob@test.com",
                      hashed_password=hash_password("bobpass"))
    db.add(bob); db.commit()
    bob_headers = auth_headers(client, "bob@test.com", "bobpass")
    resp = client.get(f"/api/orders/{order_id}", headers=bob_headers)
    assert resp.status_code == 404


def test_admin_can_list_all_orders(client, admin_user, regular_user, product):
    alice_headers = auth_headers(client, "alice@test.com", "alicepass")
    client.post("/api/cart", json={"product_id": product.id, "quantity": 1}, headers=alice_headers)
    client.post("/api/orders", json={
        "shipping_address": "123 Main St, NY 10001", "payment_method": "card"},
        headers=alice_headers)
    admin_headers = auth_headers(client, "admin@test.com", "adminpass")
    resp = client.get("/api/admin/orders", headers=admin_headers)
    assert resp.status_code == 200
    assert len(resp.json()) >= 1


def test_admin_update_order_status(client, admin_user, regular_user, product):
    alice_headers = auth_headers(client, "alice@test.com", "alicepass")
    client.post("/api/cart", json={"product_id": product.id, "quantity": 1}, headers=alice_headers)
    create = client.post("/api/orders", json={
        "shipping_address": "123 Main St, NY 10001", "payment_method": "card"},
        headers=alice_headers)
    order_id = create.json()["id"]
    admin_headers = auth_headers(client, "admin@test.com", "adminpass")
    resp = client.put(f"/api/admin/orders/{order_id}/status",
                      json={"status": "shipped"}, headers=admin_headers)
    assert resp.status_code == 200
    assert resp.json()["status"] == "shipped"


def test_order_invalid_payment_method(client, regular_user, product):
    headers = auth_headers(client, "alice@test.com", "alicepass")
    client.post("/api/cart", json={"product_id": product.id, "quantity": 1}, headers=headers)
    resp = client.post("/api/orders", json={
        "shipping_address": "123 Main St, NY 10001",
        "payment_method": "bitcoin"}, headers=headers)
    assert resp.status_code == 422


def test_orders_require_auth(client):
    resp = client.get("/api/orders")
    assert resp.status_code == 401
