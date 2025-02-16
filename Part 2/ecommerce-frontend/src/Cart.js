// src/Cart.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';

const Cart = ({ userId, onCartUpdate, serverUrl }) => {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [products, setProducts] = useState({});

  useEffect(() => {
    setLoading(true);
    setError(null);
    axios.get(`${serverUrl}/cart/${userId}`)
      .then(response => {
        setCart(response.data);
        setLoading(false);
      })
      .catch(error => {
        console.error('There was an error fetching the cart!', error);
        setError(error);
        setLoading(false);
      });
  }, [userId, serverUrl]);

  useEffect(() => {
    if (cart && cart.items) {
      const productIds = cart.items.map(item => item.productId);
      axios.get(`${serverUrl}/products?ids=${productIds.join(',')}`)
        .then(response => {
          const productsMap = response.data.reduce((map, product) => {
            map[product._id] = product;
            return map;
          }, {});
          setProducts(productsMap);
        })
        .catch(error => {
          console.error('There was an error fetching the products!', error);
        });
    }
  }, [cart, serverUrl]);

  const handleRemoveFromCart = (productId) => {
    axios.delete(`${serverUrl}/cart/${userId}/${productId}`)
      .then(response => {
        console.log('Item removed from cart:', response.data);
        onCartUpdate(); // Notify the parent component to re-fetch the cart data
      })
      .catch(error => {
        console.error('There was an error removing the item from the cart!', error);
      });
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error loading cart</div>;
  if (!cart) return <div>No cart found</div>;

  return (
    <div>
      <h1>Cart</h1>
      <ul>
        {cart.items.map(item => (
          <li key={item.productId}>
            {products[item.productId] ? products[item.productId].name : 'Unknown Product'} - Quantity: {item.quantity}
            <button onClick={() => handleRemoveFromCart(item.productId)}>Remove from Cart</button>
          </li>
        ))}
      </ul>
      <p>Total Price: ${cart.totalPrice}</p>
    </div>
  );
};

export default Cart;
