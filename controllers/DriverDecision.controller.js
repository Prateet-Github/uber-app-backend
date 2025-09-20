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
// Add/update this in your driver controller
export const updateDriverLocation = async (req, res) => {
  try {
    const { lat, lng } = req.body;
    const driverId = req.user._id;

    if (!lat || !lng) {
      return res.status(400).json({
        success: false,
        message: "Latitude and longitude are required"
      });
    }

    // Update driver location and mark as available if not on a ride
    const driver = await User.findById(driverId);
    
    if (!driver || driver.role !== 'driver') {
      return res.status(404).json({
        success: false,
        message: "Driver not found"
      });
    }

    // Update location
    driver.location = { lat, lng };
    
    // Set availability based on current ride status
    driver.isAvailable = !driver.currentRide;
    
    await driver.save();

    // Emit real-time location update to all riders
    const io = req.app.get('io');
    if (io) {
      io.emit('driver-location-update', {
        driverId: driver._id,
        username: driver.username,
        location: { lat, lng },
        isAvailable: driver.isAvailable
      });
    }

    res.json({
      success: true,
      message: "Location updated successfully",
      driver: {
        _id: driver._id,
        username: driver.username,
        location: driver.location,
        isAvailable: driver.isAvailable
      }
    });
  } catch (error) {
    console.error("Error updating driver location:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update location",
      error: error.message
    });
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
    const userId = req.user._id;
    const driver = req.user;
    
    if (driver.role !== "driver") {
      return res.status(403).json({ success: false, message: "Access denied: Not a driver" });
    }

    if (!driver.currentRide) {
      return res.status(400).json({ success: false, message: "Driver has no active ride" });
    }

    // Find the ride and populate passenger info
    const ride = await Ride.findById(driver.currentRide).populate('passengerId');
    
    if (!ride) {
      return res.status(404).json({ success: false, message: "Ride not found" });
    }

    // Store passenger ID before updating
    const passengerId = ride.passengerId._id;

    // Update driver and ride
    driver.currentRide = null;
    driver.isAvailable = true;
    ride.assignedDriver = null;
    ride.status = "completed"; // or "cancelled"

    await Promise.all([driver.save(), ride.save()]);

    // 🔥 EMIT REAL-TIME UPDATE TO THE SPECIFIC RIDER
    const io = req.app.get('io');
    if (io) {
      io.emit(`ride-completed-${passengerId}`, {
        type: 'ride-completed',
        rideId: ride._id,
        message: 'Your ride has been completed!',
        ride: {
          _id: ride._id,
          status: ride.status,
          fare: ride.fare,
          pickup: ride.pickup,
          drop: ride.drop
        }
      });
      
      console.log(`Emitted ride completion to passenger: ${passengerId}`);
    }

    res.json({
      success: true,
      message: "Ride cleared successfully",
      driver,
      ride,
    });
  } catch (error) {
    console.error("Error clearing ride:", error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to clear ride",
      error: error.message
    });
  }
};


// Add this to your driver controller
export const getActiveDrivers = async (req, res) => {
  try {
    // Find all active drivers with location data
    const activeDrivers = await User.find({
      role: 'driver',
      isAvailable: true,
      'location.lat': { $exists: true },
      'location.lng': { $exists: true },
      // Optional: filter drivers updated within last 5 minutes
      updatedAt: { $gte: new Date(Date.now() - 5 * 60 * 1000) }
    }).select('username location isAvailable currentRide');

    res.json({
      success: true,
      drivers: activeDrivers,
      count: activeDrivers.length
    });
  } catch (error) {
    console.error("Error fetching active drivers:", error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to fetch active drivers",
      error: error.message
    });
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

// New: Get driver status including availability and current ride
export const getDriverStatus = async (req, res) => {
  try {
    const driverId = req.user._id;
    const driver = req.user;

    if (driver.role !== 'driver') {
      return res.status(403).json({
        success: false,
        message: "Access denied: Not a driver"
      });
    }

    res.json({
      success: true,
      driver: {
        _id: driver._id,
        username: driver.username,
        isAvailable: driver.isAvailable,
        currentRide: driver.currentRide,
        location: driver.location
      }
    });
  } catch (error) {
    console.error("Error fetching driver status:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch driver status",
      error: error.message
    });
  }
};