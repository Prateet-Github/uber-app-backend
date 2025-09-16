import express from "express";
import { protect, authorizeRoles } from "../middlewares/Auth.middleware.js";
import {
  requestDriver,
  approveDriver,
  rejectDriver,
  pendingRequests,
  myStatus,
} from "../controllers/Driver.controller.js";

const router = express.Router();

router.post("/request-driver", protect, requestDriver);

router.get("/pending-requests", protect, authorizeRoles("admin"), pendingRequests );

router.put("/approve-driver/:id", protect, authorizeRoles("admin"), approveDriver);
router.put("/reject-driver/:id", protect, authorizeRoles("admin"), rejectDriver);

router.get("/my-status", protect, myStatus);

export default router;