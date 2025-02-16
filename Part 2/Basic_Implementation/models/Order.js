const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");

const OrderSchema = new mongoose.Schema({
    _id: { type: String, default: uuidv4 },
    userId:{type:String, required:true},
    products: [
      {
        productId: { type: String, required: true },
        quantity: { type: Number, required: true, min: 1 }
      }
    ],
    totalPrice: { type: Number, required: true }, 
    status: { type: String, enum: ["pending", "shipped", "delivered"], default: "pending" }
  }, { versionKey: false });

module.exports = mongoose.model("Order", OrderSchema);
