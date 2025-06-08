import "dotenv/config";
import express from 'express';
import cors from 'cors';
import connectDB from './database/db.js';
import authRoute from './routes/auth-routes/index.js';

const app = express();
const PORT = process.env.PORT || 5000;

cors({
  origin: process.env.CLIENT_URL,
  methods: ["GET", "POST", "DELETE", "PUT"],
  allowededHeaders: ["Content-type", "Authorization"],
});

app.use(express.json());
app.use("/auth", authRoute);

//database connection
connectDB();

//listening server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
