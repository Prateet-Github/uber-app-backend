import express from 'express';
import passport from 'passport';
import jwt from 'jsonwebtoken';
import { register } from '../controllers/User.controller.js';
import { login } from '../controllers/User.controller.js';
import User from '../models/User.model.js';

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
  async (req, res) => {
    try {
      // Ensure user has a role (in case it wasn't set during creation)
      if (!req.user.role) {
        await User.findByIdAndUpdate(req.user._id, { role: 'rider' });
        req.user.role = 'rider';
      }

      // Generate JWT token (fixed to use 'id' instead of 'userId')
      const token = jwt.sign(
        { id: req.user._id },  // Changed from userId to id
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );

      // Redirect to frontend with token
      res.redirect(`http://localhost:5173/auth/success?token=${token}&role=${req.user.role}`);
    } catch (error) {
      console.error('OAuth callback error:', error);
      res.redirect('http://localhost:5173/login?error=oauth_failed');
    }
  }
);

export default router;