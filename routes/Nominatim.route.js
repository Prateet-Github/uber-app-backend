import express from 'express';
import { geocode, reverse } from '../controllers/Nominatim.controller.js';
import { nominatimLimiter } from '../middlewares/RateLimit.middleware.js';
import { verifyTokenOptional } from '../middlewares/TokenOptional.middleware.js';

const router = express.Router();

router.post('/geocode', verifyTokenOptional, nominatimLimiter, geocode);
router.post('/reverse', verifyTokenOptional, nominatimLimiter, reverse);

export default router;