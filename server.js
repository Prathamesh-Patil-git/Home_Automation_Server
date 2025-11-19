const express = require("express");
const http = require("http");
const WebSocket = require("ws");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

// -------------------------------------------------------
// DEVICE STATES
// -------------------------------------------------------
let deviceState = {
  light1: false,
  fan: false,
  light2: false,
  light3: false
};

// -------------------------------------------------------
// HTTP STATUS CHECK
// -------------------------------------------------------
app.get("/status", (req, res) => {
  res.json({ online: true });
});

// -------------------------------------------------------
// ESP8266 – POLLS STATE
// -------------------------------------------------------
app.get("/state", (req, res) => {
  res.json(deviceState);
});

// -------------------------------------------------------
// HTTP ON/OFF CONTROL (used by React buttons)
// -------------------------------------------------------
app.get("/:id/on", (req, res) => {
  const id = req.params.id;
  if (deviceState[id] === undefined)
    return res.json({ success: false, error: "Invalid ID" });

  deviceState[id] = true;

  broadcast({
    type: "update",
    device: id,
    state: true
  });

  res.json({ success: true, state: deviceState });
});

app.get("/:id/off", (req, res) => {
  const id = req.params.id;
  if (deviceState[id] === undefined)
    return res.json({ success: false, error: "Invalid ID" });

  deviceState[id] = false;

  broadcast({
    type: "update",
    device: id,
    state: false
  });

  res.json({ success: true, state: deviceState });
});

// -------------------------------------------------------
// WEBSOCKET SERVER (React Live Updates + ESP later)
// -------------------------------------------------------
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// Broadcast function for WS clients
function broadcast(data) {
  const msg = JSON.stringify(data);
  wss.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(msg);
    }
  });
}

wss.on("connection", (ws) => {
  console.log("🔌 WebSocket Client Connected");

  // Send current state on connect
  ws.send(JSON.stringify({
    type: "init",
    devices: deviceState
  }));

  // Handle incoming WS messages
  ws.on("message", (msg) => {
    try {
      const data = JSON.parse(msg);

      if (data.type === "set") {
        deviceState[data.device] = data.state;

        broadcast({
          type: "update",
          device: data.device,
          state: data.state
        });
      }
    } catch (e) {
      console.log("❌ Invalid JSON");
    }
  });
});

// -------------------------------------------------------
const PORT = process.env.PORT || 10000;
server.listen(PORT, () => {
  console.log("🚀 Server running on port", PORT);
});
