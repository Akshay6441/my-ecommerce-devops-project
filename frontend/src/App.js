import React, { useState, useEffect } from 'react';
import './App.css';
function App() {
const [products, setProducts] = useState([]);
const [loading, setLoading] = useState(true);
const [error, setError] = useState(null);
const BACKEND_URL = process.env.REACT_APP_BACKEND_URL ||
'http://localhost:8001';
useEffect(() => {
const fetchProducts = async () => {
try {
const response = await fetch(`${BACKEND_URL}/api/products`);
if (!response.ok) {
throw new Error(`HTTP error! status: ${response.status}`);
}
const data = await response.json();setProducts(data);
} catch (error) {
setError(error);
console.error("Failed to fetch products:", error);
} finally {
setLoading(false);
}
};
fetchProducts();
}, [BACKEND_URL]);
if (loading) {
return <div className="App">Loading products...</div>;
}
if (error) {
return <div className="App">Error: {error.message}</div>;
}
return (
<div className="App">
<header className="App-header">
<h1>My Awesome Shop - Product Catalog</h1>
</header>
<main>
<div className="product-list">
{products.map(product => (
<div key={product.id} className="product-card">
<img src={product.image_url ||
'https://via.placeholder.com/150'} alt={product.name} />
<h2>{product.name}</h2>
<p>{product.description}</p>
<p><strong>${product.price.toFixed(2)}</strong></p>
<p>Category: {product.category}</p>
<p>In Stock: {product.stock_quantity}</p>
</div>
))}
</div>
</main>
</div>
);
}
export default App;