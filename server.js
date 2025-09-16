import express from 'express';
import dotenv from 'dotenv';
dotenv.config();
import connectDB from './configs/db.js';
import userRoutes from './routes/Auth.route.js';
import session from 'express-session';
import passport from 'passport';
import './configs/passport.js'; 
import cors from 'cors';
import driverRoutes from './routes/Driver.route.js';

connectDB();

const app = express();

app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:5173'],
  credentials: true,
  optionsSuccessStatus: 200 
}));

app.use(express.json());

app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false } 
}));

app.use(passport.initialize());
app.use(passport.session());

const PORT = process.env.PORT || 5001;

app.get('/', (req, res) => {
  res.send('Hello, World!');
});

app.use('/api/users', userRoutes);
app.use('/api/driver',driverRoutes)


app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});