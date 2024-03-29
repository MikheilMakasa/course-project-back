import express from 'express';
import postRoutes from './routes/posts.js';
import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import cors from 'cors';
import * as dotenv from 'dotenv';
import cookieParser from 'cookie-parser';

dotenv.config();
const app = express();

// Enable CORS
app.use(
  cors({
    origin: ['https://ureview-makasa.netlify.app', 'http://localhost:3000'],
    credentials: true,
  })
);

app.use(cookieParser());
app.use(express.json());

app.use('/api/posts', postRoutes);
app.use('/api/users', userRoutes);
app.use('/api/auth', authRoutes);

const port = process.env.PORT || 8800;
app.listen(port, () => {
  console.log('Connected to port ' + port);
});
