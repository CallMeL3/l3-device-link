
const WebSocket = require("ws");
const crypto = require("crypto");

const PORT = process.env.PORT || 3000;
const wss = new WebSocket.Server({ port: PORT });
const rooms = new Map();

function send(ws, message) {
  if (ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify(message));
  }
}

wss.on("connection", (ws) => {
  let roomCode = null;
  const deviceId = crypto.randomUUID();

  send(ws, { type: "connected", deviceId });

  ws.on("message", (raw) => {
    let message;

    try {
      message = JSON.parse(raw.toString());
    } catch {
      send(ws, { type: "error", message: "Invalid message." });
      return;
    }

    if (message.type === "create-room") {
      roomCode = crypto.randomInt(100000, 1000000).toString();
      rooms.set(roomCode, new Set([ws]));
      send(ws, { type: "room-created", code: roomCode });
      return;
    }

    if (message.type === "join-room") {
      const code = String(message.code || "");
      const room = rooms.get(code);

      if (!room || room.size >= 2) {
        send(ws, { type: "error", message: "Room not found or full." });
        return;
      }

      roomCode = code;
      room.add(ws);
      send(ws, { type: "room-joined" });

      for (const client of room) {
        if (client !== ws) send(client, { type: "peer-joined" });
      }
      return;
    }

    if (message.type === "signal" && roomCode) {
      const room = rooms.get(roomCode);
      if (!room) return;

      for (const client of room) {
        if (client !== ws) {
          send(client, { type: "signal", data: message.data });
        }
      }
    }
  });

  ws.on("close", () => {
    if (!roomCode) return;

    const room = rooms.get(roomCode);
    if (!room) return;

    room.delete(ws);

    for (const client of room) {
      send(client, { type: "peer-left" });
    }

    if (room.size === 0) rooms.delete(roomCode);
  });
});

console.log(`L3 Device Link server listening on port ${PORT}`);
