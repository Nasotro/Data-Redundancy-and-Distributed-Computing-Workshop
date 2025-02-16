// models/Product.js
const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");
const { primaryConnection, secondaryConnection } = require("../server");

const ProductSchema = new mongoose.Schema({
  _id: { type: String, default: uuidv4 },
  name: { type: String, required: true },
  description: { type: String },
  price: { type: Number, required: true },
  category: { type: String, required: true },
  inStock: { type: Boolean, default: true },
}, { versionKey: false });

const Product = primaryConnection.model("Product", ProductSchema);
const ProductMirror = secondaryConnection.model("ProductMirror", ProductSchema);

module.exports = { Product, ProductMirror };
