import express from "express";
import {
  requestRide,
  acceptRide,
  rejectRide,
  completeRide,
  cancelRide,
  getRide,
  getPaymentDetails,
} from "../controllers/RiderRequest.controller.js";
import { protect,authorizeRoles } from "../middlewares/Auth.middleware.js";

const router = express.Router();

router.post("/request", protect, authorizeRoles("rider"), requestRide);

// Only drivers can accept/reject/complete rides
router.patch("/:rideId/accept", protect, authorizeRoles("driver"), acceptRide);
router.patch("/:rideId/reject", protect, authorizeRoles("driver"), rejectRide);
router.patch("/:rideId/complete", protect, authorizeRoles("driver"), completeRide);

// Only the passenger can cancel their ride
router.patch("/:rideId/cancel", protect, authorizeRoles("rider"), cancelRide);

// Both driver and rider should be able to view ride details
router.get("/:rideId", protect, getRide);

router.get("/:rideId/payment", protect, authorizeRoles("rider", "driver"), getPaymentDetails);

export default router;