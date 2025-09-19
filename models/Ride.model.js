import mongoose from "mongoose";

const rideSchema = new mongoose.Schema(
  {
    passengerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    driverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    pickup: {
      type: {
        lat: Number,
        lng: Number,
      },
      required: true,
    },
    drop: {
      type: {
        lat: Number,
        lng: Number,
      },
      required: true,
    },
    fare: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "accepted", "rejected", "completed", "cancelled"],
      default: "pending",
    },
  },
  { timestamps: true }
);

const Ride = mongoose.model("Ride", rideSchema);
export default Ride;