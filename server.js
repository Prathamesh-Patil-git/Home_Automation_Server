const express = require("express");
const http = require("http");
const WebSocket = require("ws");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

let deviceState = {
  light1: "off",
  fan: "off",
  light2: "off",
  light3: "off"
};

app.get("/status", (req, res) => {
  res.json({ online: true, devices: deviceState });
});

// -------------------------------------------------------
// WEBSOCKET SERVER
// -------------------------------------------------------
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

wss.on("connection", (ws) => {
  console.log("🔌 Device Connected");

  // Send current state to newly connected devices
  ws.send(JSON.stringify({
    type: "init",
    devices: deviceState
  }));

  ws.on("message", (msg) => {
    console.log("Received:", msg);

    try {
      const data = JSON.parse(msg);

      if (data.type === "set") {
        deviceState[data.device] = data.state;

        // Broadcast to ALL connected clients (React + ESP)
        wss.clients.forEach(client => {
          if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify({
              type: "update",
              device: data.device,
              state: data.state
            }));
          }
        });
      }
    } catch (e) {
      console.log("Invalid JSON");
    }
  });
});

server.listen(10000, () => {
  console.log("Server running on port 10000");
});
