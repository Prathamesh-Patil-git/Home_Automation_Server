const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

// -------------------------------------------------------
// DEVICE STATES (React + ESP will use this)
// -------------------------------------------------------
let deviceState = {
  light1: false,
  fan: false,
  light2: false,
  light3: false
};

// -------------------------------------------------------
// REACT — CHECK BACKEND STATUS
// -------------------------------------------------------
app.get("/status", (req, res) => {
  res.json({ online: true });
});

// -------------------------------------------------------
// ESP8266 — POLLS DEVICE STATUS EVERY 1 SEC
// -------------------------------------------------------
app.get("/state", (req, res) => {
  res.json({
    devices: {
      light1: deviceState.light1 ? "on" : "off",
      fan: deviceState.fan ? "on" : "off",
      light2: deviceState.light2 ? "on" : "off",
      light3: deviceState.light3 ? "on" : "off",
    }
  });
});

// -------------------------------------------------------
// REACT — TURN DEVICE ON
// -------------------------------------------------------
app.get("/:id/on", (req, res) => {
  const id = req.params.id;
  if (!(id in deviceState))
    return res.json({ success: false, error: "Invalid ID" });

  deviceState[id] = true;

  res.json({ success: true, state: deviceState });
});

// -------------------------------------------------------
// REACT — TURN DEVICE OFF
// -------------------------------------------------------
app.get("/:id/off", (req, res) => {
  const id = req.params.id;
  if (!(id in deviceState))
    return res.json({ success: false, error: "Invalid ID" });

  deviceState[id] = false;

  res.json({ success: true, state: deviceState });
});

// -------------------------------------------------------
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log("🚀 Server running on port", PORT);
});
