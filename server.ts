import express from "express";
import { createServer } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { createServer as createViteServer } from "vite";
import path from "path";

async function startServer() {
  const app = express();
  const server = createServer(app);
  const wss = new WebSocketServer({ server });
  const PORT = 3000;

  app.use(express.json());

  // Store connected clients
  const clients = new Set<WebSocket>();

  wss.on("connection", (ws) => {
    clients.add(ws);
    console.log("Client connected to notifications");

    ws.on("close", () => {
      clients.delete(ws);
      console.log("Client disconnected");
    });
  });

  // In-memory user storage
  const users: any[] = [
    { id: '1', name: 'Felix Henderson', email: 'felix@example.com', phone: '+1 555 0101', pin: '123456', balance: 0, status: 'active', joinDate: '2024-01-15' },
    { id: '2', name: 'Sarah Jenkins', email: 'sarah.j@example.com', phone: '+1 555 0102', pin: '654321', balance: 0, status: 'active', joinDate: '2024-02-01' },
    { id: '3', name: 'Michael Chen', email: 'm.chen@example.com', phone: '+1 555 0103', pin: '111222', balance: 0, status: 'suspended', joinDate: '2024-02-10' },
    { id: '4', name: 'Elena Rodriguez', email: 'elena.r@example.com', phone: '+1 555 0104', pin: '999888', balance: 0, status: 'active', joinDate: '2024-02-15' },
  ];

  // API to register a new user
  app.post("/api/users/register", (req, res) => {
    const newUser = {
      id: (users.length + 1).toString(),
      ...req.body,
      balance: 0,
      status: 'active',
      joinDate: new Date().toISOString().split('T')[0]
    };
    users.push(newUser);
    res.json({ status: "ok", user: newUser });
  });

  // API to get all users
  app.get("/api/users", (req, res) => {
    res.json(users);
  });

  // API to update user balance
  app.post("/api/users/update-balance", (req, res) => {
    const { id, balance } = req.body;
    const userIndex = users.findIndex(u => u.id === id);
    if (userIndex !== -1) {
      users[userIndex].balance = balance;
      res.json({ status: "ok", user: users[userIndex] });
    } else {
      res.status(404).json({ status: "error", message: "User not found" });
    }
  });

  // API to trigger a notification (for testing/integration)
  app.post("/api/notify", (req, res) => {
    const { title, message, type, amount, asset } = req.body;
    
    const notification = {
      id: Date.now().toString(),
      title,
      message,
      type, // 'receive' | 'send' | 'trade'
      amount,
      asset,
      timestamp: new Date().toISOString()
    };

    const payload = JSON.stringify({ type: "NOTIFICATION", data: notification });
    
    clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(payload);
      }
    });

    res.json({ status: "ok", notification });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(process.cwd(), "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(process.cwd(), "dist", "index.html"));
    });
  }

  server.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
