// models/Cart.js
const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");
const { primaryConnection, secondaryConnection } = require("../server");

const CartSchema = new mongoose.Schema({
  _id: { type: String, default: uuidv4 },
  userId: { type: String, required: true },
  items: [
    {
      productId: { type: String, required: true },
      quantity: { type: Number, required: true, min: 1 },
    },
  ],
  totalPrice: { type: Number, required: true },
}, { versionKey: false });

const Cart = primaryConnection.model("Cart", CartSchema);
const CartMirror = secondaryConnection.model("CartMirror", CartSchema);

module.exports = { Cart, CartMirror };
