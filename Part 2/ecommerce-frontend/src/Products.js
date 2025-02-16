// src/Products.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';

const Products = ({ userId, onAddToCart, serverUrl }) => {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    axios.get(`${serverUrl}/products`)
      .then(response => {
        setProducts(response.data);
      })
      .catch(error => {
        console.error('There was an error fetching the products!', error);
      });
  }, [serverUrl]);

  const handleAddToCart = (productId) => {
    const item = { productId, quantity: 1 };
    onAddToCart(item);
  };

  return (
    <div>
      <h1>Products</h1>
      <ul>
        {products.map(product => (
          <li key={product._id}>
            {product.name} - ${product.price}
            <button onClick={() => handleAddToCart(product._id)}>Add to Cart</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Products;
