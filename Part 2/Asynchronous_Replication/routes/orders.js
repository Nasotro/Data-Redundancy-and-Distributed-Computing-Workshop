// routes/orders.js
const express = require("express");
const { Order, OrderMirror } = require("../models/Order");
const { Product, ProductMirror } = require("../models/Product");
const { v4: uuidv4 } = require("uuid");

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const { products, userId } = req.body;

    if (!products || !Array.isArray(products) || products.length === 0) {
      return res.status(400).json({ error: "Invalid product data" });
    }

    let totalPrice = 0;

    for (const item of products) {
      const product = await Product.findById(item.productId);
      if (!product) {
        return res.status(404).json({ error: `Product not found: ${item.productId}` });
      }
      totalPrice += product.price * item.quantity;
    }

    const newOrder = new Order({
      _id: uuidv4(),
      products,
      totalPrice,
      userId: userId || "guest",
    });

    await newOrder.save();

    // Asynchronously replicate the order to the secondary database
    const orderMirror = new OrderMirror(newOrder);
    orderMirror.save().catch(err => console.error("Error saving order mirror:", err));

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
