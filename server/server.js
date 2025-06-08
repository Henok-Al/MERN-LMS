require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { default: connectDB } = require("./database/db");

const app = express();
const PORT = process.env.PORT || 5000;

cors({
  origin: process.env.CLIENT_URL,
  methods: ["GET", "POST", "DELETE", "PUT"],
  allowededHeaders: ["Content-type", "Authorization"],
});

app.use(express.json());

//database connection
connectDB();

//listening server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
