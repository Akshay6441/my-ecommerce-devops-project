from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field
from typing import List, Optional
from uuid import UUID, uuid4
app = FastAPI(
title="Product Catalog API",
description="A simple API for managing products in an e-commerce
catalog."
)
class Product(BaseModel):
id: UUID = Field(default_factory=uuid4)
name: str
description: Optional[str] = None
price: float
image_url: Optional[str] = None
category: Optional[str] = None
stock_quantity: int = 0
products_db: List[Product] = [
Product(
id=uuid4(),
name="Laptop Pro X",
description="Powerful laptop for professionals.",
price=1200.00,
image_url="https://via.placeholder.com/150/FF0000/FFFFFF?text=Laptop",
category="Electronics",stock_quantity=10
),
Product(
id=uuid4(),
name="Wireless Mouse Z",
description="Ergonomic design for comfortable use.",
price=25.99,
image_url="https://via.placeholder.com/150/0000FF/FFFFFF?text=Mouse",
category="Electronics",
stock_quantity=50
),
Product(
id=uuid4(),
name="Designer T-Shirt",
description="100% Cotton, comfortable fit.",
price=29.99,
image_url="https://via.placeholder.com/150/00FF00/FFFFFF?text=T-Shirt"
,
category="Apparel",
stock_quantity=100
)
]
@app.get("/api/products", response_model=List[Product])
async def get_products():
"""Retrieve a list of all products."""
return products_db
@app.get("/api/products/{product_id}", response_model=Product)
async def get_product(product_id: UUID):
"""Retrieve a single product by ID."""for product in products_db:
if product.id == product_id:
return product
raise HTTPException(status_code=404, detail="Product not found")
@app.post("/api/products", response_model=Product, status_code=201)
async def create_product(product: Product):
"""Add a new product to the catalog (Admin only)."""
products_db.append(product)
return product