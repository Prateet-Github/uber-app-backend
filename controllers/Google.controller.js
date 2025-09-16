import jwt from 'jsonwebtoken';
import User from '../models/User.model.js';

export const googleCallback = async (req, res) => {
    try {
      if (!req.user.role) {
        await User.findByIdAndUpdate(req.user._id, { role: 'rider' });
        req.user.role = 'rider';
      }

      const token = jwt.sign(
        { id: req.user._id },  // Changed from userId to id
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );

      res.redirect(`http://localhost:5173/auth/success?token=${token}&role=${req.user.role}`);
    } catch (error) {
      console.error('OAuth callback error:', error);
      res.redirect('http://localhost:5173/login?error=oauth_failed');
    }
};