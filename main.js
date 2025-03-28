const cors = require("cors");
const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(bodyParser.json());

mongoose
  .connect("mongodb+srv://<username>:<password>@cluster0.wkh13vp.mongodb.net/drivingBehavior")
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
  });

const drivingEventSchema = new mongoose.Schema({
  driverId: {
    type: String,
    required: true,
  },
  acceleration: {
    type: Number,
    required: true,
  },
  braking: {
    type: Number,
    required: true,
  },
  turn: {
    type: Number,
    required: true,
  },
  isFlagged: {
    type: Boolean,
    required: true,
  },
  sustainabilityScore: {
    type: Number,
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

const DrivingEvent = mongoose.model("DrivingEvent", drivingEventSchema);

const ACCELERATION_THRESHOLD = 3.0;
const BRAKING_THRESHOLD = 4.0;
const TURN_THRESHOLD = 2.5;

app.post("/monitor-behavior", async (req, res) => {
  try {
    const { driverId, acceleration, braking, turn, timestamp } = req.body;

    if (!Boolean(driverId) || !Boolean(acceleration) || !Boolean(braking) || !Boolean(turn)) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    if (isNaN(acceleration) || isNaN(braking) || isNaN(turn)) {
      return res.status(400).json({ error: "Acceleration, braking, and turn must be numeric values" });
    }

    const isFlagged = acceleration > ACCELERATION_THRESHOLD || braking > BRAKING_THRESHOLD || turn > TURN_THRESHOLD;

    const normalizedTurn = Math.min(turn / TURN_THRESHOLD, 1);
    const normalizedBraking = Math.min(braking / BRAKING_THRESHOLD, 1);
    const normalizedAcceleration = Math.min(acceleration / ACCELERATION_THRESHOLD, 1);

    const avgNormalized = (normalizedAcceleration + normalizedBraking + normalizedTurn) / 3;

    const sustainabilityScore = parseFloat((1 - avgNormalized).toFixed(2));

    const drivingEvent = new DrivingEvent({
      driverId,
      acceleration,
      braking,
      turn,
      isFlagged,
      sustainabilityScore,
      timestamp: timestamp || new Date(),
    });

    await drivingEvent.save();

    res.status(201).json({
      driverId,
      acceleration,
      braking,
      turn,
      isFlagged,
      timestamp: drivingEvent.timestamp,
      sustainabilityScore,
    });
  } catch (error) {
    console.error("Error processing driving data:", error);
    res.status(500).json({ error: "Server error" });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
