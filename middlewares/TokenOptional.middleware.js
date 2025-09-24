import jwt from "jsonwebtoken";
import User from "../models/User.model.js";

export const verifyTokenOptional = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select('-password');
      req.user = user || undefined;
    } catch (err) {
      req.user = undefined; // ignore invalid/expired token
    }
  } else {
    req.user = undefined; // no token
  }
  next();
};