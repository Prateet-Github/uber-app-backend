import express from "express";
import {
  toggleAvailability,
  updateDriverLocation,
  assignCurrentRide,
  clearCurrentRide,
  updateRating,
  getPendingRides,
  getActiveDrivers,
  getDriverStatus
} from "../controllers/DriverDecision.controller.js";

import { protect, authorizeRoles } from "../middlewares/Auth.middleware.js";

const router = express.Router();

// ✅ SPECIFIC ROUTES FIRST (no parameters)
router.get("/pending", protect, authorizeRoles("driver"), getPendingRides);
router.get('/active-drivers', protect, getActiveDrivers);
router.get('/status', protect, authorizeRoles('driver'), getDriverStatus);
router.patch("/clear-ride", protect, authorizeRoles("driver"), clearCurrentRide);
router.patch("/location", protect, authorizeRoles("driver"), updateDriverLocation);

// ✅ PARAMETERIZED ROUTES LAST (with :userId, :id, etc.)
router.patch("/:userId/location", protect, authorizeRoles("driver"), updateDriverLocation);
// router.patch("/:userId/availability", protect, authorizeRoles("driver"), toggleAvailability);
// router.patch("/:userId/rating", protect, authorizeRoles("driver"), updateRating);

export default router;