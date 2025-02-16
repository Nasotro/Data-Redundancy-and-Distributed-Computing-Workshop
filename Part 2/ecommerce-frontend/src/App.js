// src/App.js
import React, { useState, useCallback, useEffect } from 'react';
import Products from './Products';
import Cart from './Cart';
import axios from 'axios';
import './App.css';

function App() {
  const [userId, setUserId] = useState('user123'); // Default user ID
  const [cartKey, setCartKey] = useState(0); // Key to force re-render of Cart component
  const [serverUrl, setServerUrl] = useState('http://localhost:5000');

  useEffect(() => {
    // Fetch the server URL from the DNS registry
    axios.get('http://localhost:4000/getServer')
      .then(response => {
        setServerUrl(`http://${response.data.server}`);
      })
      .catch(error => {
        console.error('There was an error fetching the server URL!', error);
      });
  }, []);

  const handleUserChange = (event) => {
    setUserId(event.target.value);
    setCartKey(prevKey => prevKey + 1); // Force re-render of Cart component
  };

  const handleAddToCart = useCallback((item) => {
    axios.post(`${serverUrl}/cart/${userId}`, { items: [item] })
      .then(response => {
        console.log('Item added to cart:', response.data);
        setCartKey(prevKey => prevKey + 1); // Force re-render of Cart component
      })
      .catch(error => {
        console.error('There was an error adding the item to the cart!', error);
      });
  }, [userId, serverUrl]);

  const handleCartUpdate = useCallback(() => {
    setCartKey(prevKey => prevKey + 1); // Force re-render of Cart component
  }, []);

  return (
    <div className="App">
      <h1>E-Commerce Frontend</h1>
      <div>
        <label htmlFor="userSelect">Select User: </label>
        <select id="userSelect" value={userId} onChange={handleUserChange}>
          <option value="user123">User 123</option>
          <option value="user456">User 456</option>
          <option value="user789">User 789</option>
          {/* Add more users as needed */}
        </select>
      </div>
      <Products userId={userId} onAddToCart={handleAddToCart} serverUrl={serverUrl} />
      <Cart key={cartKey} userId={userId} onCartUpdate={handleCartUpdate} serverUrl={serverUrl} />
    </div>
  );
}

export default App;
