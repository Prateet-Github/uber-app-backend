import express from "express";
import {
  toggleAvailability,
  updateLocation,
  assignCurrentRide,
  clearCurrentRide,
  updateRating,
  getPendingRides
} from "../controllers/DriverDecision.controller.js";

import { protect, authorizeRoles } from "../middlewares/Auth.middleware.js";

const router = express.Router();

router.get("/pending", protect, authorizeRoles("driver"), getPendingRides);
router.patch("/:userId/availability", protect, authorizeRoles("driver"), toggleAvailability);
router.patch("/:userId/location", protect, authorizeRoles("driver"), updateLocation);
// router.patch("/assign-ride", protect, authorizeRoles("driver"), assignCurrentRide);
router.patch("/:userId/clear-ride", protect, authorizeRoles("driver"), clearCurrentRide);
// router.patch("/:userId/rating", protect, authorizeRoles("driver"), updateRating);

export default router;