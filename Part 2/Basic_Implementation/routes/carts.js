// Part 2/E-Commerce/routes/carts.js
const express = require("express");
const Cart = require("../models/Cart");
const Product = require("../models/Product");
const { v4: uuidv4 } = require("uuid");

const router = express.Router();

router.post("/:userId", async (req, res) => {
  try {
    const { items } = req.body;

    // Validate the cart items
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: "Invalid cart items" });
    }

    let cart = await Cart.findOne({ userId: req.params.userId });
    if (!cart) {
      // Create a new cart if it doesn't exist
      cart = new Cart({
        _id: uuidv4(),
        userId: req.params.userId,
        items: [],
        totalPrice: 0
      });
    }

    let totalPriceIncrement = 0;

    // Update or add items to the cart
    for (const newItem of items) {
      const existingItem = cart.items.find(item => item.productId === newItem.productId);
      if (existingItem) {
        // Increment the quantity if the item already exists
        existingItem.quantity += newItem.quantity;
      } else {
        // Add the new item if it doesn't exist
        cart.items.push(newItem);
      }

      // Calculate the total price increment
      const product = await Product.findById(newItem.productId);
      if (product) {
        totalPriceIncrement += newItem.quantity * product.price;
      }
    }

    // Update the total price
    cart.totalPrice += totalPriceIncrement;

    await cart.save();
    res.status(201).json(cart);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

router.get("/:userId", async (req, res) => {
  try {
    const cart = await Cart.findOne({ userId: req.params.userId });
    if (!cart) {
      return res.status(404).json({ error: "Cart not found for this user" });
    }
    res.json(cart);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

router.delete("/:userId/:productId", async (req, res) => {
  try {
    const { userId, productId } = req.params;
    const cart = await Cart.findOne({ userId });

    if (!cart) {
      return res.status(404).json({ error: "Cart not found for this user" });
    }

    // Remove the item from the cart
    cart.items = cart.items.filter(item => item.productId !== productId);

    // Recalculate total price
    const productPrices = await Promise.all(cart.items.map(async item => {
      const product = await Product.findById(item.productId);
      return product ? product.price * item.quantity : 0;
    }));

    cart.totalPrice = productPrices.reduce((total, price) => total + price, 0);

    await cart.save();
    res.json(cart);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

router.delete("/:userId", async (req, res) => {
  try {
    const deletedCart = await Cart.findOneAndDelete({ userId: req.params.userId });
    if (!deletedCart) {
      return res.status(404).json({ error: "Cart not found for this user" });
    }

    res.json({ message: "Cart deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
