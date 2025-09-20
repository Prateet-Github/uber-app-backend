import User from "../models/User.model.js";
import Ride from "../models/Ride.model.js";

// Update driver availability (online/offline)
export const toggleAvailability = async (req, res) => {
  try {
    const { userId } = req.params; // driver ID
    const { isAvailable } = req.body;

    const driver = await User.findById(userId);
    if (!driver || driver.role !== "driver") {
      return res.status(404).json({ success: false, message: "Driver not found" });
    }

    driver.isAvailable = isAvailable;
    await driver.save();

    res.json({ success: true, message: `Driver is now ${isAvailable ? "online" : "offline"}`, driver });
  } catch (error) {
    console.error("Error toggling availability:", error);
    res.status(500).json({ success: false, message: "Failed to update availability" });
  }
};

// Update driver location (called via socket or API)
export const updateLocation = async (req, res) => {
  try {
    const { lat, lng } = req.body;
    const driverId = req.user.id; // from protect middleware

    if (lat == null || lng == null) {
      return res.status(400).json({ success: false, message: "Latitude and longitude are required" });
    }

    const driver = await User.findById(driverId);
    if (!driver || driver.role !== "driver") {
      return res.status(404).json({ success: false, message: "Driver not found" });
    }

    driver.location = { lat, lng, updatedAt: new Date() };
    await driver.save();

    res.json({ success: true, message: "Location updated", location: driver.location });
  } catch (error) {
    console.error("Error updating location:", error);
    res.status(500).json({ success: false, message: "Failed to update location" });
  }
};

// Assign current ride to driver (when accepted)
export const assignCurrentRide = async (req, res) => {
  try {
    const { rideId } = req.body;
    const driver = req.user; // comes from protect middleware

    if (driver.currentRide) {
      return res.status(400).json({ success: false, message: "Driver already has an active ride" });
    }

    const ride = await Ride.findById(rideId);
    if (!ride) {
      return res.status(404).json({ success: false, message: "Ride not found" });
    }
    if (ride.assignedDriver) {
      return res.status(400).json({ success: false, message: "Ride already assigned" });
    }

    driver.currentRide = ride._id;
    driver.isAvailable = false;
    ride.assignedDriver = driver._id;
    ride.status = "assigned";

    await Promise.all([driver.save(), ride.save()]);

    res.json({ success: true, message: "Ride assigned successfully", driver, ride });
  } catch (error) {
    console.error("Error assigning ride:", error);
    res.status(500).json({ success: false, message: "Failed to assign ride" });
  }
};

// Clear current ride (after completion or cancellation)
export const clearCurrentRide = async (req, res) => {
  try {
    const { userId } = req.params;

    // 1. Find driver
    const driver = await User.findById(userId);
    if (!driver || driver.role !== "driver") {
      return res.status(404).json({ success: false, message: "Driver not found" });
    }

    // 2. Check if driver actually has a ride
    if (!driver.currentRide) {
      return res.status(400).json({ success: false, message: "Driver has no active ride" });
    }

    // 3. Find the ride
    const ride = await Ride.findById(driver.currentRide);
    if (!ride) {
      return res.status(404).json({ success: false, message: "Ride not found" });
    }

    // 4. Update driver
    driver.currentRide = null;
    driver.isAvailable = true;

    // 5. Update ride (mark it as completed or cleared)
    ride.assignedDriver = null;
    ride.status = "completed"; // or "cancelled", depending on your flow

    // 6. Save both updates together
    await Promise.all([driver.save(), ride.save()]);

    res.json({
      success: true,
      message: "Ride cleared successfully",
      driver,
      ride,
    });
  } catch (error) {
    console.error("Error clearing ride:", error);
    res.status(500).json({ success: false, message: "Failed to clear ride" });
  }
};

// Update rating after ride
export const updateRating = async (req, res) => {
  try {
    const { userId } = req.params;
    const { rating } = req.body;

    const driver = await User.findById(userId);
    if (!driver || driver.role !== "driver") {
      return res.status(404).json({ success: false, message: "Driver not found" });
    }

    // Recalculate average rating
    driver.rating.average = ((driver.rating.average * driver.rating.count) + rating) / (driver.rating.count + 1);
    driver.rating.count += 1;

    await driver.save();

    res.json({ success: true, message: "Rating updated", rating: driver.rating });
  } catch (error) {
    console.error("Error updating rating:", error);
    res.status(500).json({ success: false, message: "Failed to update rating" });
  }
};

// Get all pending ride requests (for drivers to view)
export const getPendingRides = async (req, res) => {
  try {
    // Only pending rides
    const rides = await Ride.find({ status: "pending" }).populate(
      "passengerId",
      "username email"
    );

    return res.json({ success: true, rides });
  } catch (error) {
    console.error("Error fetching pending rides:", error);
    res.status(500).json({ success: false, message: "Failed to fetch rides" });
  }
};