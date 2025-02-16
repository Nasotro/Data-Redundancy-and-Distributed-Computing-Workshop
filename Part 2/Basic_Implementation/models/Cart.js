const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");

const CartSchema = new mongoose.Schema({
    _id: { type: String, default: uuidv4 },
    userId:{type:String, required:true},
    items: [
      {
        productId: { type: String, required: true },
        quantity: { type: Number, required: true, min: 1 }
      }
    ],
    totalPrice:{type:Number, required:true}
  }, { versionKey: false });

module.exports = mongoose.model("Cart", CartSchema);
