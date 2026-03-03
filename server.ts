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

    ws.on("message", (data) => {
      try {
        const message = JSON.parse(data.toString());
        if (message.type === "CHAT_MESSAGE") {
          const chatMsg = {
            id: Date.now().toString(),
            ...message.data,
            timestamp: new Date().toISOString()
          };
          messages.push(chatMsg);
          
          // Broadcast to all clients (simple implementation for demo)
          // In a real app, you'd target specific users
          const payload = JSON.stringify({ type: "CHAT_MESSAGE", data: chatMsg });
          clients.forEach((client) => {
            if (client.readyState === WebSocket.OPEN) {
              client.send(payload);
            }
          });
        }
      } catch (e) {
        console.error("Failed to parse message", e);
      }
    });

    ws.on("close", () => {
      clients.delete(ws);
      console.log("Client disconnected");
    });
  });

  // In-memory user storage
  let users: any[] = [];

  // In-memory deposit accounts
  let depositAccounts: any[] = [
    { id: '1', bankName: 'Meridian Central Bank', accountName: 'Meridian Wealth Corp', accountNumber: '8829304112', type: 'Checking' },
  ];

  // In-memory crypto wallets
  let cryptoWallets: any[] = [
    { id: '1', coin: 'Bitcoin', symbol: 'BTC', address: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh', network: 'BTC' },
    { id: '2', coin: 'Ethereum', symbol: 'ETH', address: '0x71C7656EC7ab88b098defB751B7401B5f6d8976F', network: 'ERC20' },
    { id: '3', coin: 'Tether', symbol: 'USDT', address: '0x71C7656EC7ab88b098defB751B7401B5f6d8976F', network: 'ERC20' },
  ];

  // In-memory transactions
  const transactions: any[] = [];

  // In-memory chat messages
  const messages: any[] = [];

  // API to register a new user
  app.post("/api/users/register", (req, res) => {
    const newUser = {
      id: Date.now().toString(),
      ...req.body,
      balance: 0,
      status: 'active',
      joinDate: new Date().toISOString().split('T')[0]
    };
    users.push(newUser);

    // Broadcast registration to admin
    const payload = JSON.stringify({ type: "USER_REGISTERED", data: newUser });
    clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(payload);
      }
    });

    res.json({ status: "ok", user: newUser });
  });

  // API to login a user (for tracking activity)
  app.post("/api/users/login", (req, res) => {
    const { email } = req.body;
    const user = users.find(u => u.email === email);
    
    if (user) {
      // Broadcast login to admin
      const payload = JSON.stringify({ 
        type: "USER_LOGGED_IN", 
        data: { ...user, lastLogin: new Date().toISOString() } 
      });
      clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(payload);
        }
      });
      res.json({ status: "ok", user });
    } else {
      res.status(404).json({ status: "error", message: "User not found" });
    }
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

  // API for deposit accounts
  app.get("/api/deposit-accounts", (req, res) => {
    res.json(depositAccounts);
  });

  app.post("/api/admin/deposit-accounts", (req, res) => {
    const newAccount = { id: Date.now().toString(), ...req.body };
    depositAccounts.push(newAccount);
    res.json({ status: "ok", account: newAccount });
  });

  app.delete("/api/admin/deposit-accounts/:id", (req, res) => {
    depositAccounts = depositAccounts.filter(a => a.id !== req.params.id);
    res.json({ status: "ok" });
  });

  // API for crypto wallets
  app.get("/api/crypto-wallets", (req, res) => {
    res.json(cryptoWallets);
  });

  app.post("/api/admin/crypto-wallets", (req, res) => {
    const newWallet = { id: Date.now().toString(), ...req.body };
    cryptoWallets.push(newWallet);
    res.json({ status: "ok", wallet: newWallet });
  });

  app.put("/api/admin/crypto-wallets/:id", (req, res) => {
    const { id } = req.params;
    const { address } = req.body;
    const walletIndex = cryptoWallets.findIndex(w => w.id === id);
    if (walletIndex !== -1) {
      cryptoWallets[walletIndex].address = address;
      res.json({ status: "ok", wallet: cryptoWallets[walletIndex] });
    } else {
      res.status(404).json({ status: "error", message: "Wallet not found" });
    }
  });

  app.delete("/api/admin/crypto-wallets/:id", (req, res) => {
    cryptoWallets = cryptoWallets.filter(w => w.id !== req.params.id);
    res.json({ status: "ok" });
  });

  // API for transactions
  app.post("/api/transactions", (req, res) => {
    const { userId, type, amount, details } = req.body;
    const userIndex = users.findIndex(u => u.id === userId);
    
    if (userIndex === -1 && userId !== 'current') {
      return res.status(404).json({ status: "error", message: "User not found" });
    }

    const transaction = {
      id: Date.now().toString(),
      userId,
      type, // 'send' | 'withdraw' | 'deposit'
      amount,
      details,
      timestamp: new Date().toISOString(),
      status: 'pending'
    };

    transactions.push(transaction);
    res.json({ status: "ok", transaction });
  });

  app.get("/api/transactions/:userId", (req, res) => {
    const userTransactions = transactions.filter(t => t.userId === req.params.userId || t.userId === 'current');
    res.json(userTransactions);
  });

  // API for chat messages
  app.get("/api/messages/:userId", (req, res) => {
    const { userId } = req.params;
    // If userId is 'admin', return all messages grouped by user for the admin portal
    if (userId === 'admin') {
      res.json(messages);
    } else {
      // Return messages for a specific user (either sent by them or to them)
      const userMessages = messages.filter(m => m.userId === userId || m.receiverId === userId);
      res.json(userMessages);
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
