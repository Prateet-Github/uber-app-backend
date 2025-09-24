import express from 'express';
import { geocode, reverse } from '../controllers/Nominatim.controller.js';
import { nominatimLimiter } from '../middlewares/RateLimit.middleware.js';
import { verifyTokenOptional } from '../middlewares/TokenOptional.middleware.js';

const router = express.Router();

router.get('/geocode', verifyTokenOptional, nominatimLimiter, geocode);
router.get('/reverse', verifyTokenOptional, nominatimLimiter, reverse);

export default router;