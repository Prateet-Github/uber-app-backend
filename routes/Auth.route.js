import express from 'express';
import passport from 'passport';
import { register } from '../controllers/User.controller.js';
import { login } from '../controllers/User.controller.js';
import { googleCallback } from '../controllers/Google.controller.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);

router.get('/google',passport.authenticate('google', { scope: ['profile', 'email'] }));
router.get('/google/callback', passport.authenticate('google', { failureRedirect: 'http://localhost:5173/login' }),googleCallback);

export default router;