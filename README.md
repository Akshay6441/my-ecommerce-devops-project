# ShopVibe — Full-Stack E-Commerce Platform

A production-ready e-commerce application built with **FastAPI** + **React** + **PostgreSQL**, containerized with Docker Compose.

---

## Quick Start

### Prerequisites
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed and running

### Run the full stack

```bash
docker compose up --build
```

| Service  | URL                          |
|----------|------------------------------|
| Shop     | http://localhost             |
| API docs | http://localhost:8001/docs   |
| Database | localhost:5432               |

First boot seeds the database automatically with 14 products, 5 categories, and an admin account.

---

## Demo Credentials

| Role  | Email             | Password   |
|-------|-------------------|------------|
| Admin | admin@shop.com    | admin123   |

Register any new account for a customer role.

---

## Features

### Frontend
- **Home** — Hero banner, category grid, featured products, promo banners, trust badges, newsletter
- **Shop** — URL-driven filters (category, price range, featured), search, sort, pagination
- **Product Detail** — Image gallery, star ratings, reviews, related products, qty stepper
- **Cart** — Guest + authenticated cart, qty management, order summary, free shipping threshold
- **Checkout** — 3-step flow: Shipping → Payment → Review & Place Order
- **Orders** — Collapsible order history with item details and status tracking
- **Profile** — Edit name/phone/address/avatar, account stats
- **Auth** — Login with demo fill, register with password strength hints, JWT token management
- **Admin Dashboard** — Stats cards, full product CRUD (create/edit/delete), inline order status updates

### Backend (FastAPI)
- JWT authentication (bcrypt passwords, 7-day tokens)
- Full CRUD: Products, Categories, Cart, Orders, Reviews
- PostgreSQL via SQLAlchemy ORM
- Auto-seeded database on first boot
- Paginated product listings with search, filter, sort
- Admin-only endpoints for product management and order status

---

## Tech Stack

| Layer     | Technology                              |
|-----------|-----------------------------------------|
| Frontend  | React 18, React Router 6, Tailwind CSS  |
| State     | Zustand (cart), React Context (auth)    |
| HTTP      | Axios with JWT interceptor              |
| Backend   | FastAPI, SQLAlchemy, Pydantic v2        |
| Auth      | python-jose (JWT), passlib (bcrypt)     |
| Database  | PostgreSQL 15                           |
| Server    | Nginx (gzip, caching, SPA fallback)     |
| Container | Docker Compose                          |

---

## Project Structure

```
├── backend/
│   ├── main.py          # FastAPI app + all routes
│   ├── models.py        # SQLAlchemy ORM models
│   ├── schemas.py       # Pydantic request/response schemas
│   ├── auth.py          # JWT + bcrypt helpers
│   ├── database.py      # DB engine + session
│   ├── seed.py          # Initial data seeder
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── api/         # Axios API clients
│   │   ├── components/  # Layout + common UI components
│   │   ├── context/     # AuthContext
│   │   ├── pages/       # All page components
│   │   └── store/       # Zustand cart store
│   ├── tailwind.config.js
│   └── nginx.conf
└── compose.yaml
```

---

## Environment Variables

| Variable      | Default                                    | Description         |
|---------------|--------------------------------------------|---------------------|
| DATABASE_URL  | postgresql://user:password@db:5432/mydb    | PostgreSQL URL      |
| SECRET_KEY    | (set in compose.yaml)                      | JWT signing secret  |

**Change `SECRET_KEY` before deploying to production.**
