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
import { createServer } from "http";
import { Server } from "socket.io";
import drivesRoutes from './routes/DriverDecision.route.js';
import ridesRoutes from './routes/RideRequest.route.js';

connectDB();

const app = express();

app.use(cors({
  origin: ['http://localhost:5173', '*'],
  credentials: true,
  methods: ["GET", "POST", "PATCH", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use(express.json());

const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: ['*'],
    methods: ["GET", "POST"],
    credentials: true
  }
});

io.on("connection", (socket) => {
  console.log("Client connected:", socket.id);

  socket.on("driverLocation", (data) => {
    console.log("Driver location:", data);
  
    socket.broadcast.emit("driverLocationUpdate", data);
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
});

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
app.use('/api/driver-decision', drivesRoutes);
app.use('/api/rides', ridesRoutes);


httpServer.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
