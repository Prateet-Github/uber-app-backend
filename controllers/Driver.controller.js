import User from "../models/User.model.js";

// User requests to become driver
export const requestDriver = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) return res.status(404).json({ message: "User not found" });
    if (user.driverRequest === "pending") {
      return res.status(400).json({ message: "Request already pending" });
    }

    user.driverRequest = "pending";
    await user.save();

    res.json({ message: "Driver request submitted", user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Admin approves request
export const approveDriver = async (req, res) => {
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