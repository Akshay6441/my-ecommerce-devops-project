"""Tests for /api/products and /api/categories endpoints."""
from tests.conftest import auth_headers


def test_list_products_empty(client):
    resp = client.get("/api/products")
    assert resp.status_code == 200
    data = resp.json()
    assert data["total"] == 0
    assert data["items"] == []


def test_list_products_with_data(client, product):
    resp = client.get("/api/products")
    assert resp.status_code == 200
    data = resp.json()
    assert data["total"] == 1
    assert data["items"][0]["name"] == "Test Laptop"


def test_list_products_pagination(client, db, category):
    import models
    for i in range(15):
        db.add(models.Product(name=f"Product {i}", slug=f"product-{i}",
                               price=10.0 + i, stock_quantity=5,
                               is_active=True, category_id=category.id))
    db.commit()
    resp = client.get("/api/products?page=1&per_page=10")
    assert resp.status_code == 200
    data = resp.json()
    assert data["total"] == 15
    assert data["pages"] == 2
    assert len(data["items"]) == 10


def test_list_products_filter_category(client, product, category):
    resp = client.get("/api/products?category=electronics")
    assert resp.status_code == 200
    assert resp.json()["total"] == 1


def test_list_products_filter_price(client, product):
    resp = client.get("/api/products?min_price=500&max_price=1500")
    assert resp.status_code == 200
    assert resp.json()["total"] == 1

    resp2 = client.get("/api/products?min_price=1500")
    assert resp2.json()["total"] == 0


def test_list_products_sort(client, db, category):
    import models
    db.add(models.Product(name="Cheap", slug="cheap", price=10.0, stock_quantity=1, is_active=True))
    db.add(models.Product(name="Expensive", slug="expensive", price=999.0, stock_quantity=1, is_active=True))
    db.commit()
    resp = client.get("/api/products?sort=price_asc")
    items = resp.json()["items"]
    assert items[0]["price"] <= items[-1]["price"]


def test_get_product_by_slug(client, product):
    resp = client.get(f"/api/products/{product.slug}")
    assert resp.status_code == 200
    assert resp.json()["name"] == "Test Laptop"


def test_get_product_not_found(client):
    resp = client.get("/api/products/nonexistent-slug")
    assert resp.status_code == 404


def test_create_product_admin(client, admin_user, category):
    headers = auth_headers(client, "admin@test.com", "adminpass")
    payload = {"name": "New Phone", "slug": "new-phone", "price": 499.99,
               "stock_quantity": 20, "category_id": category.id}
    resp = client.post("/api/products", json=payload, headers=headers)
    assert resp.status_code == 201
    assert resp.json()["name"] == "New Phone"


def test_create_product_requires_admin(client, regular_user):
    headers = auth_headers(client, "alice@test.com", "alicepass")
    payload = {"name": "Sneaky Product", "slug": "sneaky", "price": 9.99, "stock_quantity": 1}
    resp = client.post("/api/products", json=payload, headers=headers)
    assert resp.status_code == 403


def test_create_product_invalid_price(client, admin_user):
    headers = auth_headers(client, "admin@test.com", "adminpass")
    payload = {"name": "Bad Product", "slug": "bad-product", "price": -5.0, "stock_quantity": 1}
    resp = client.post("/api/products", json=payload, headers=headers)
    assert resp.status_code == 422


def test_create_product_negative_stock(client, admin_user):
    headers = auth_headers(client, "admin@test.com", "adminpass")
    payload = {"name": "Bad Stock", "slug": "bad-stock", "price": 10.0, "stock_quantity": -1}
    resp = client.post("/api/products", json=payload, headers=headers)
    assert resp.status_code == 422


def test_update_product(client, admin_user, product):
    headers = auth_headers(client, "admin@test.com", "adminpass")
    resp = client.put(f"/api/products/{product.id}",
                      json={"price": 799.99, "stock_quantity": 5}, headers=headers)
    assert resp.status_code == 200
    assert resp.json()["price"] == 799.99


def test_delete_product(client, admin_user, product):
    headers = auth_headers(client, "admin@test.com", "adminpass")
    resp = client.delete(f"/api/products/{product.id}", headers=headers)
    assert resp.status_code == 204
    assert client.get(f"/api/products/{product.slug}").status_code == 404


def test_list_categories(client, category):
    resp = client.get("/api/categories")
    assert resp.status_code == 200
    assert len(resp.json()) == 1
    assert resp.json()[0]["slug"] == "electronics"


def test_search_suggestions(client, product):
    resp = client.get("/api/search/suggestions?q=laptop")
    assert resp.status_code == 200
    results = resp.json()
    assert len(results) >= 1
    assert results[0]["name"] == "Test Laptop"
