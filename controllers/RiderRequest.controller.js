import User from "../models/User.model.js";
import Ride from "../models/Ride.model.js";

// Passenger requests a ride
export const requestRide = async (req, res) => {
  try {
    // take passenger id directly from the logged-in user
    const passengerId = req.user._id; 

    const { pickup, drop, fare } = req.body;

    // Create new ride
    const ride = await Ride.create({
      passengerId,
      pickup,
      drop,
      fare,
      status: "pending",
    });

    return res.status(201).json({ success: true, ride });
  } catch (error) {
    console.error("Error requesting ride:", error);
    res.status(500).json({ success: false, message: "Failed to request ride" });
  }
};
// Driver accepts ride
export const acceptRide = async (req, res) => {
  try {
    const { rideId } = req.params;
    const driverId = req.user._id; // get driver from JWT

    // Find the ride
    const ride = await Ride.findById(rideId);
    if (!ride)
      return res.status(404).json({ success: false, message: "Ride not found" });

    if (ride.status !== "pending")
      return res.status(400).json({ success: false, message: "Ride already taken" });

    // Assign driver and update status
    ride.driverId = driverId;
    ride.status = "accepted";
    ride.acceptedAt = new Date();
    await ride.save();

    // Update driver
    const driver = await User.findById(driverId);
    if (!driver || driver.role !== "driver") {
      return res.status(404).json({ success: false, message: "Driver not found" });
    }
    driver.currentRide = ride._id;
    driver.isAvailable = false;
    await driver.save();

    // Update passenger
    const passenger = await User.findById(ride.passengerId);
    if (passenger) {
      passenger.currentRide = ride._id;
      await passenger.save();
    }

    // (Later) Emit socket events
    return res.json({ success: true, ride });
  } catch (error) {
    console.error("Error accepting ride:", error);
    res.status(500).json({ success: false, message: "Failed to accept ride" });
  }
};
// Driver rejects ride
export const rejectRide = async (req, res) => {
  try {
    const { rideId } = req.params;

    const ride = await Ride.findById(rideId);
    if (!ride) return res.status(404).json({ success: false, message: "Ride not found" });

    ride.status = "rejected";
    await ride.save();

    // (Later) Could notify passenger via socket
    return res.json({ success: true, ride });
  } catch (error) {
    console.error("Error rejecting ride:", error);
    res.status(500).json({ success: false, message: "Failed to reject ride" });
  }
};

// Complete ride
export const completeRide = async (req, res) => {
  try {
    const { rideId } = req.params;

    const ride = await Ride.findById(rideId);
    if (!ride) return res.status(404).json({ success: false, message: "Ride not found" });

    ride.status = "completed";
    ride.completedAt = new Date();
    await ride.save();

    // Clear currentRide for driver & passenger
    if (ride.driverId) {
      const driver = await User.findById(ride.driverId);
      if (driver) {
        driver.currentRide = null;
        driver.isAvailable = true;
        await driver.save();
      }
    }

    const passenger = await User.findById(ride.passengerId);
    if (passenger) {
      passenger.currentRide = null;
      await passenger.save();
    }

    // (Later) Emit socket event ride completed
    return res.json({ success: true, ride });
  } catch (error) {
    console.error("Error completing ride:", error);
    res.status(500).json({ success: false, message: "Failed to complete ride" });
  }
};

// Cancel ride (by passenger)
export const cancelRide = async (req, res) => {
  try {
    const { rideId } = req.params;

    const ride = await Ride.findById(rideId);
    if (!ride) return res.status(404).json({ success: false, message: "Ride not found" });

    ride.status = "cancelled";
    await ride.save();

    // Clear currentRide for driver if assigned
    if (ride.driverId) {
      const driver = await User.findById(ride.driverId);
      if (driver) {
        driver.currentRide = null;
        driver.isAvailable = true;
        await driver.save();
      }
    }

    // Clear passenger currentRide
    const passenger = await User.findById(ride.passengerId);
    if (passenger) {
      passenger.currentRide = null;
      await passenger.save();
    }

    return res.json({ success: true, ride });
  } catch (error) {
    console.error("Error cancelling ride:", error);
    res.status(500).json({ success: false, message: "Failed to cancel ride" });
  }
};

// Get ride details
export const getRide = async (req, res) => {
  try {
    const { rideId } = req.params;
    const ride = await Ride.findById(rideId).populate("passengerId driverId", "username email role");

    if (!ride) return res.status(404).json({ success: false, message: "Ride not found" });

    return res.json({ success: true, ride });
  } catch (error) {
    console.error("Error fetching ride:", error);
    res.status(500).json({ success: false, message: "Failed to get ride" });
  }
};