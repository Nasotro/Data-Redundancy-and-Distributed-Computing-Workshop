// routes/carts.js
const express = require("express");
const { Cart, CartMirror } = require("../models/Cart");
const { Product, ProductMirror } = require("../models/Product");
const { v4: uuidv4 } = require("uuid");

const router = express.Router();

router.post("/:userId", async (req, res) => {
  try {
    const { items } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: "Invalid cart items" });
    }

    let cart = await Cart.findOne({ userId: req.params.userId });
    if (!cart) {
      cart = new Cart({
        _id: uuidv4(),
        userId: req.params.userId,
        items: [],
        totalPrice: 0,
      });
    }

    let totalPriceIncrement = 0;

    for (const newItem of items) {
      const existingItem = cart.items.find(item => item.productId === newItem.productId);
      if (existingItem) {
        existingItem.quantity += newItem.quantity;
      } else {
        cart.items.push(newItem);
      }

      const product = await Product.findById(newItem.productId);
      if (product) {
        totalPriceIncrement += newItem.quantity * product.price;
      }
    }

    cart.totalPrice += totalPriceIncrement;

    await cart.save();

    // Mirror the cart to the secondary database
    const cartMirror = new CartMirror(cart);
    await cartMirror.save();

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

    cart.items = cart.items.filter(item => item.productId !== productId);

    const productPrices = await Promise.all(cart.items.map(async item => {
      const product = await Product.findById(item.productId);
      return product ? product.price * item.quantity : 0;
    }));

    cart.totalPrice = productPrices.reduce((total, price) => total + price, 0);

    await cart.save();

    // Mirror the cart to the secondary database
    const cartMirror = new CartMirror(cart);
    await cartMirror.save();

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

    // Mirror the cart deletion to the secondary database
    await CartMirror.findOneAndDelete({ userId: req.params.userId });

    res.json({ message: "Cart deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
