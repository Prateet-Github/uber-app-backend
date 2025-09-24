import express from 'express';
import { geocode, reverse } from '../controllers/Nominatim.controller.js';

const router = express.Router();

router.get('/geocode', geocode);
router.get('/reverse', reverse);

export default router;