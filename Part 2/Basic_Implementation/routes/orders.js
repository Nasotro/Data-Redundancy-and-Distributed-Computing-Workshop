const express = require("express");
const Order = require("../models/Order");
const Product = require("../models/Product");
const { v4: uuidv4 } = require("uuid");

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const { products, userId } = req.body;

    // Check if products array exists
    if (!products || !Array.isArray(products) || products.length === 0) {
      return res.status(400).json({ error: "Invalid product data" });
    }

    let totalPrice = 0;

    // Fetch product details and calculate total price
    for (const item of products) {
      const product = await Product.findById(item.productId);
      if (!product) {
        return res.status(404).json({ error: `Product not found: ${item.productId}` });
      }
      totalPrice += product.price * item.quantity;
    }

    // Create new order
    const newOrder = new Order({
      _id: uuidv4(),
      products,
      totalPrice,
      userId: userId || "guest", // Optional user tracking
    });

    await newOrder.save();
    res.status(201).json(newOrder);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});


router.get("/:userId", async (req, res) => {
    try {
      const orders = await Order.find({ userId: req.params.userId });
      if (!orders.length) {
        return res.status(404).json({ error: "No orders found for this user" });
      }
      res.json(orders);
    } catch (err) {
      res.status(500).json({ error: "Server error" });
    }
  });

module.exports = router;
