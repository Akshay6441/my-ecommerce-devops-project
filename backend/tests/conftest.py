"""Shared pytest fixtures — in-memory SQLite, no Postgres or file permissions needed."""
import os
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine, event
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

# Set env vars FIRST — before any app module is imported
os.environ["DATABASE_URL"] = "sqlite://"   # pure in-memory, no file
os.environ["SECRET_KEY"] = "test-secret-key-32chars-for-tests!"
os.environ["STRIPE_SECRET_KEY"] = "sk_test_placeholder"
os.environ["STRIPE_WEBHOOK_SECRET"] = "whsec_placeholder"
os.environ["APP_ENV"] = "test"

# Now safe to import app modules
from database import Base, get_db  # noqa: E402
from main import app               # noqa: E402
import models                      # noqa: E402
from auth import hash_password     # noqa: E402

# Create a single shared in-memory engine for the whole test session.
# StaticPool ensures all connections share the same in-memory database.
# check_same_thread=False is required for FastAPI's threaded TestClient.
TEST_ENGINE = create_engine(
    "sqlite://",
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)

# Enable foreign key support for SQLite
@event.listens_for(TEST_ENGINE, "connect")
def _set_sqlite_pragma(dbapi_conn, _):
    dbapi_conn.execute("PRAGMA foreign_keys=ON")

TestingSessionLocal = sessionmaker(
    autocommit=False, autoflush=False, bind=TEST_ENGINE
)


@pytest.fixture(scope="function", autouse=True)
def setup_db():
    """Create all tables before each test, drop after."""
    Base.metadata.create_all(bind=TEST_ENGINE)
    yield
    Base.metadata.drop_all(bind=TEST_ENGINE)


@pytest.fixture(scope="function")
def db():
    session = TestingSessionLocal()
    try:
        yield session
    finally:
        session.close()


@pytest.fixture(scope="function")
def client(db):
    """TestClient wired to the shared in-memory DB."""
    def override_get_db():
        try:
            yield db
        finally:
            pass

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app, raise_server_exceptions=True) as c:
        yield c
    app.dependency_overrides.clear()


@pytest.fixture
def admin_user(db):
    user = models.User(
        name="Admin", email="admin@test.com",
        hashed_password=hash_password("adminpass"),
        role=models.UserRole.admin,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@pytest.fixture
def regular_user(db):
    user = models.User(
        name="Alice", email="alice@test.com",
        hashed_password=hash_password("alicepass"),
        role=models.UserRole.customer,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@pytest.fixture
def category(db):
    cat = models.Category(
        name="Electronics", slug="electronics", description="Gadgets"
    )
    db.add(cat)
    db.commit()
    db.refresh(cat)
    return cat


@pytest.fixture
def product(db, category):
    p = models.Product(
        name="Test Laptop", slug="test-laptop",
        description="A great laptop", price=999.99,
        stock_quantity=10, category_id=category.id,
        brand="TestBrand", is_active=True,
    )
    db.add(p)
    db.commit()
    db.refresh(p)
    return p


def auth_headers(client, email, password):
    """Login and return Authorization header dict."""
    resp = client.post("/api/auth/login", json={"email": email, "password": password})
    assert resp.status_code == 200, resp.text
    return {"Authorization": f"Bearer {resp.json()['access_token']}"}
