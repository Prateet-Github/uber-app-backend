import jwt from "jsonwebtoken";
import User from "../models/User.model.js";

// Middleware to protect routes
const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    // More explicit token extraction
    let token;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({ message: 'Not authorized, no token provided' });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Find user and exclude password
    const user = await User.findById(decoded.id).select('-password');
    
    if (!user) {
      return res.status(401).json({ message: "Not authorized, user not found" });
    }

    // Attach user to request
    req.user = user;
    next();
    
  } catch (error) {
    console.error('JWT Auth Error:', error);
    
    // More specific error messages
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Not authorized, invalid token' });
    } else if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Not authorized, token expired' });
    } else {
      return res.status(401).json({ message: 'Not authorized, token verification failed' });
    }
  }
};

// Middleware to authorize roles
const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: "Forbidden: You don't have access to this resource" });
    }
    next();
  };
};

export { protect, authorizeRoles };