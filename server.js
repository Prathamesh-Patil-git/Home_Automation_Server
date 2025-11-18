const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

let systemOnline = false;
let devices = {
  light1: false,
  fan: false,
  light2: false,
  light3: false
};

// --------------------------
// CHECK SYSTEM ONLINE/OFFLINE
// --------------------------
app.get("/status", (req, res) => {
  res.json({ online: systemOnline });
});

// ESP32 sends online ping
app.get("/ping", (req, res) => {
  systemOnline = true;
  console.log("ESP32 ONLINE");
  res.send("pong");
});

// --------------------------
// DEVICE ON/OFF ENDPOINTS
// --------------------------
app.get("/:device/on", (req, res) => {
  const device = req.params.device;

  if (devices[device] !== undefined) {
    devices[device] = true;
    console.log(device + " turned ON");
    res.json({ device, state: true });
  } else {
    res.status(404).json({ error: "Device not found" });
  }
});

app.get("/:device/off", (req, res) => {
  const device = req.params.device;

  if (devices[device] !== undefined) {
    devices[device] = false;
    console.log(device + " turned OFF");
    res.json({ device, state: false });
  } else {
    res.status(404).json({ error: "Device not found" });
  }
});

// --------------------------
// START SERVER
// --------------------------
const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log("Backend running on port", port);
});
