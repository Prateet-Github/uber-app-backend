import express from 'express';
import passport from 'passport';
import jwt from 'jsonwebtoken';
import { register } from '../controllers/User.controller.js';
import { login } from '../controllers/User.controller.js';

const router = express.Router();

// Your existing routes
router.post('/register', register);
router.post('/login', login);

// Add these Google OAuth routes
router.get('/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

router.get('/google/callback',
  passport.authenticate('google', { failureRedirect: 'http://localhost:5173/login' }),
  (req, res) => {
    // Generate JWT token (same as your existing auth)
    const token = jwt.sign(
      { userId: req.user._id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Redirect to frontend with token
    res.redirect(`http://localhost:5173/auth/success?token=${token}`);
  }
);

export default router;