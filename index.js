import express from 'express';
import postRoutes from './routes/posts.js';
import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import cors from 'cors';
import * as dotenv from 'dotenv';
import db from './db.js';
import cookieParser from 'cookie-parser';

dotenv.config();
const app = express();
app.use(
  cors({
    origin: 'https://ureview-makasa.netlify.app',
    credentials: true,
  })
);

// 'https://ureview-makasa.netlify.app'
// 'http://localhost:3000'
app.use(cookieParser());
app.use(express.json());

app.use('/api/posts', postRoutes);
app.use('/api/users', userRoutes);
app.use('/api/auth', authRoutes);

db.connect((err) => {
  if (err) {
    console.log('Error connecting to MySQL database');
    return;
  }
  console.log('Connected to MySQL database');
});

const port = process.env.PORT || 8800;
app.listen(port, () => {
  console.log('connected to port ' + port);
});
