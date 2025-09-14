import express from 'express';
import dotenv from 'dotenv';
dotenv.config();
import connectDB from './configs/db.js';
import userRoutes from './routes/Auth.route.js';
import session from 'express-session';
import passport from 'passport';
import './configs/passport.js'; // Ensure passport config is imported
import cors from 'cors';
import { createServer } from "http";
import { Server } from "socket.io";

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

const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

app.get('/', (req, res) => {
  res.send('Hello, World!');
});

app.use('/api/users', userRoutes);

httpServer.listen(PORT, () => {
  console.log(`Server and Socket running on port ${PORT}`);
});