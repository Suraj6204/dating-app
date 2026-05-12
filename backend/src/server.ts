import express from 'express';
// import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.route.js';
import profileRoutes from './routes/profile.route.js';
import cookieParser from "cookie-parser";
dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

// app.use(cors());
app.use(express.json());
app.use(cookieParser());

app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);

app.get('/', (req, res) => {
  res.send('Dating App API running');
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
