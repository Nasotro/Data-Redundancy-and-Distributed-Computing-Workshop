const express = require("express");
const Product = require("../models/Product");

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const { category, inStock } = req.query;
    let filter = {};
    if (category) filter.category = category;
    if (inStock) filter.inStock = inStock === "true";

    const products = await Product.find(filter);
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ error: "Product not found" });

    res.json(product);
  } catch (err) {
    res.status(500).json({ error: "Invalid product ID" });
  }
});

router.post("/", async (req, res) => {
    try {
      const newProduct = new Product({
        name: req.body.name,
        description: req.body.description,
        price: req.body.price,
        category: req.body.category,
        inStock: req.body.inStock
      });
  
      await newProduct.save(); // Save product to database
  
      res.status(201).json(newProduct); // Return the created product with _id
    } catch (err) {
      res.status(400).json({ error: "Invalid product data" });
    }
  });
  

router.put("/:id", async (req, res) => {
  try {
    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!updatedProduct) return res.status(404).json({ error: "Product not found" });

    res.json(updatedProduct);
  } catch (err) {
    res.status(500).json({ error: "Invalid product ID" });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const deletedProduct = await Product.findByIdAndDelete(req.params.id);
    if (!deletedProduct) return res.status(404).json({ error: "Product not found" });

    res.json({ message: "Product deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: "Invalid product ID" });
  }
});

module.exports = router;
