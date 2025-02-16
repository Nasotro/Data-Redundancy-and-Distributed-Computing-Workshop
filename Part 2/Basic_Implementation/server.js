const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const productRoutes = require("./routes/products");
const orderRoutes=require("./routes/orders");
const cartRoutes=require("./routes/carts");

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

// Connection to MongoDB
mongoose
  .connect("mongodb://localhost:27017/ecommerce", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

//Testing route
app.get("/", (req, res) => {
  res.send("E-commerce API is running!");
});

app.use("/products", productRoutes);

app.use("/orders", orderRoutes);

app.use("/cart", cartRoutes);

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
