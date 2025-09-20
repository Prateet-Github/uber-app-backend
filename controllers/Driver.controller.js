import User from "../models/User.model.js";

// User requests to become driver
export const requestDriver = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) return res.status(404).json({ message: "User not found" });

    // 🚫 Already approved driver
    if (user.role === "driver" && user.driverRequest === "accepted") {
      return res
        .status(400)
        .json({ message: "You are already approved as a driver" });
    }

    // 🚫 Already requested & pending
    if (user.driverRequest === "pending") {
      return res
        .status(400)
        .json({ message: "Your request is already pending approval" });
    }

    // ✅ First-time request
    user.driverRequest = "pending";
    await user.save();

    res.json({ message: "Driver request submitted successfully", user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
// Admin approves request
export const approveDriver = async (req, res) => {
   console.log("Approving user:", req.params.id);
  try {
    const user = await User.findById(req.params.id);

    if (!user) return res.status(404).json({ message: "User not found" });

    user.driverRequest = "accepted";
    user.role = "driver";
    await user.save();

    res.json({ message: "Driver request approved", user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Admin rejects request
export const rejectDriver = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) return res.status(404).json({ message: "User not found" });

    user.driverRequest = "rejected";
    await user.save();

    res.json({ message: "Driver request rejected", user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Admin views all pending requests
export const pendingRequests = async (req, res) => {
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
}

// User views their own driver request status
export const myStatus = async (req, res) => {
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
}