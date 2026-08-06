"""Initial schema — all tables

Revision ID: 001
Revises:
Create Date: 2026-08-03
"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

revision: str = "001"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Enums
    userrole = sa.Enum("customer", "admin", name="userrole")
    orderstatus = sa.Enum("pending", "processing", "shipped", "delivered", "cancelled",
                          name="orderstatus")
    userrole.create(op.get_bind(), checkfirst=True)
    orderstatus.create(op.get_bind(), checkfirst=True)

    op.create_table("users",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("name", sa.String(100), nullable=False),
        sa.Column("email", sa.String(255), unique=True, nullable=False),
        sa.Column("hashed_password", sa.String(255), nullable=False),
        sa.Column("role", sa.Enum("customer", "admin", name="userrole"), default="customer"),
        sa.Column("is_active", sa.Boolean(), default=True),
        sa.Column("avatar_url", sa.String(500)),
        sa.Column("phone", sa.String(30)),
        sa.Column("address", sa.Text()),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )
    op.create_index("ix_users_email", "users", ["email"])

    op.create_table("categories",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("name", sa.String(100), unique=True, nullable=False),
        sa.Column("slug", sa.String(120), unique=True, nullable=False),
        sa.Column("description", sa.Text()),
        sa.Column("image_url", sa.String(500)),
    )

    op.create_table("products",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("name", sa.String(200), nullable=False),
        sa.Column("slug", sa.String(220), unique=True, nullable=False),
        sa.Column("description", sa.Text()),
        sa.Column("price", sa.Float(), nullable=False),
        sa.Column("original_price", sa.Float()),
        sa.Column("image_url", sa.String(500)),
        sa.Column("images", sa.Text()),
        sa.Column("category_id", sa.Integer(), sa.ForeignKey("categories.id")),
        sa.Column("stock_quantity", sa.Integer(), default=0),
        sa.Column("is_featured", sa.Boolean(), default=False),
        sa.Column("is_active", sa.Boolean(), default=True),
        sa.Column("rating", sa.Float(), default=0.0),
        sa.Column("review_count", sa.Integer(), default=0),
        sa.Column("brand", sa.String(100)),
        sa.Column("tags", sa.Text()),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )
    op.create_index("ix_products_slug", "products", ["slug"])
    op.create_index("ix_products_name", "products", ["name"])

    op.create_table("cart_items",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("user_id", sa.Integer(), sa.ForeignKey("users.id"), nullable=False),
        sa.Column("product_id", sa.Integer(), sa.ForeignKey("products.id"), nullable=False),
        sa.Column("quantity", sa.Integer(), default=1),
    )

    op.create_table("orders",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("user_id", sa.Integer(), sa.ForeignKey("users.id"), nullable=False),
        sa.Column("status", sa.Enum("pending","processing","shipped","delivered","cancelled",
                                    name="orderstatus"), default="pending"),
        sa.Column("total_amount", sa.Float(), nullable=False),
        sa.Column("shipping_address", sa.Text(), nullable=False),
        sa.Column("payment_method", sa.String(50), default="card"),
        sa.Column("payment_status", sa.String(50), default="pending"),
        sa.Column("stripe_session_id", sa.String(255)),
        sa.Column("notes", sa.Text()),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), onupdate=sa.func.now()),
    )

    op.create_table("order_items",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("order_id", sa.Integer(), sa.ForeignKey("orders.id"), nullable=False),
        sa.Column("product_id", sa.Integer(), sa.ForeignKey("products.id"), nullable=False),
        sa.Column("quantity", sa.Integer(), nullable=False),
        sa.Column("unit_price", sa.Float(), nullable=False),
    )

    op.create_table("reviews",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("user_id", sa.Integer(), sa.ForeignKey("users.id"), nullable=False),
        sa.Column("product_id", sa.Integer(), sa.ForeignKey("products.id"), nullable=False),
        sa.Column("rating", sa.Integer(), nullable=False),
        sa.Column("title", sa.String(200)),
        sa.Column("comment", sa.Text()),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )

    op.create_table("wishlist_items",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("user_id", sa.Integer(), sa.ForeignKey("users.id"), nullable=False),
        sa.Column("product_id", sa.Integer(), sa.ForeignKey("products.id"), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.UniqueConstraint("user_id", "product_id", name="uq_user_product_wishlist"),
    )


def downgrade() -> None:
    for table in ["wishlist_items","reviews","order_items","orders","cart_items","products",
                  "categories","users"]:
        op.drop_table(table)
    op.execute("DROP TYPE IF EXISTS orderstatus")
    op.execute("DROP TYPE IF EXISTS userrole")
