const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const productRoutes = require("./routes/products");
const orderRoutes = require("./routes/orders");
const cartRoutes = require("./routes/carts");

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

let primaryConnection;
let secondaryConnection;

// Function to initialize connections
const initializeConnections = () => {
  if (!primaryConnection && !secondaryConnection) {
    // Connection to Primary MongoDB
    primaryConnection = mongoose.createConnection("mongodb://localhost:27017/ecommerce", {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    primaryConnection.on("open", () => {
      console.log("Primary MongoDB Connected");
    });

    primaryConnection.on("error", (err) => {
      console.error("Primary MongoDB connection error:", err);
    });

    // Connection to Secondary MongoDB
    secondaryConnection = mongoose.createConnection("mongodb://localhost:27018/ecommerce_mirror", {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    secondaryConnection.on("open", () => {
      console.log("Secondary MongoDB Connected");
    });

    secondaryConnection.on("error", (err) => {
      console.error("Secondary MongoDB connection error:", err);
    });
  }

  return { primaryConnection, secondaryConnection };
};

// Initialize connections
const { primaryConnection: primary, secondaryConnection: secondary } = initializeConnections();

// Testing route
app.get("/", (req, res) => {
  res.send("E-commerce API is running!");
});

console.log("Primary MongoDB Connection:", primary);

app.use("/products", productRoutes);
app.use("/orders", orderRoutes);
app.use("/cart", cartRoutes);

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

// module.exports = new initializeConnections();
module.exports = {"test": "test"};
