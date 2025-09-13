import express from 'express';
import dotenv from 'dotenv';
dotenv.config();
import connectDB from './configs/db.js';
import userRoutes from './routes/Auth.route.js';
import session from 'express-session';
import passport from 'passport';
import './configs/passport.js'; // Ensure passport config is imported
import cors from 'cors';


connectDB();


const app = express();
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:5173'],
  credentials: true,
  optionsSuccessStatus: 200 // For legacy browser support
}));
app.use(express.json());
// Add these middleware AFTER your existing middleware but BEFORE your routes
app.use(session({
  secret: process.env.SESSION_SECRET, // Add this to your .env file
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false } // Set to true in production with HTTPS
}));

app.use(passport.initialize());
app.use(passport.session());

const PORT = process.env.PORT || 5001;

console.log('Environment check:');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('GOOGLE_CLIENT_ID exists:', !!process.env.GOOGLE_CLIENT_ID);
console.log('GOOGLE_CLIENT_SECRET exists:', !!process.env.GOOGLE_CLIENT_SECRET);

app.get('/', (req, res) => {
  res.send('Hello, World!');
});

app.use('/api/users', userRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});