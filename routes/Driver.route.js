import express from "express";
import { protect, authorizeRoles } from "../middlewares/Auth.middleware.js";
import {
  requestDriver,
  approveDriver,
  rejectDriver,
} from "../controllers/Driver.controller.js";

import User from "../models/User.model.js";

const router = express.Router();

// Rider requests driver role
router.post("/request-driver", protect, requestDriver);

// Admin views pending requests
router.get("/pending-requests", protect, authorizeRoles("admin"), async (req, res) => {
  try {
    const pendingRequests = await User.find({ 
      driverRequest: "pending" 
    }).select('username email _id driverRequest');

    res.json({ 
      success: true, 
      requests: pendingRequests 
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Admin handles requests
router.put("/approve-driver/:id", protect, authorizeRoles("admin"), approveDriver);
router.put("/reject-driver/:id", protect, authorizeRoles("admin"), rejectDriver);

// Get user's own driver application status
router.get("/my-status", protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    
    res.json({
      success: true,
      driverRequest: user.driverRequest,
      role: user.role
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


export default router;