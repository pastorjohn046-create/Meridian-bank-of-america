import express from "express";
import { createServer } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { createServer as createViteServer } from "vite";
import path from "path";
import Database from "better-sqlite3";

const db = new Database("database.db");

// Initialize database schema
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    name TEXT,
    email TEXT UNIQUE,
    pin TEXT,
    balance REAL DEFAULT 0,
    accountNumber TEXT,
    sortCode TEXT,
    status TEXT DEFAULT 'active',
    joinDate TEXT
  );

  CREATE TABLE IF NOT EXISTS deposit_accounts (
    id TEXT PRIMARY KEY,
    bankName TEXT,
    accountName TEXT,
    accountNumber TEXT,
    type TEXT
  );

  CREATE TABLE IF NOT EXISTS crypto_wallets (
    id TEXT PRIMARY KEY,
    coin TEXT,
    symbol TEXT,
    address TEXT,
    network TEXT
  );

  CREATE TABLE IF NOT EXISTS transactions (
    id TEXT PRIMARY KEY,
    userId TEXT,
    userName TEXT,
    type TEXT,
    amount REAL,
    details TEXT,
    timestamp TEXT,
    status TEXT DEFAULT 'pending'
  );

  CREATE TABLE IF NOT EXISTS messages (
    id TEXT PRIMARY KEY,
    userId TEXT,
    receiverId TEXT,
    text TEXT,
    senderName TEXT,
    timestamp TEXT
  );
`);

// Seed initial admin if not exists
const adminExists = db.prepare("SELECT * FROM users WHERE email = ?").get("Jobfindercorps@gmail.com") as any;
if (!adminExists) {
  db.prepare(`
    INSERT INTO users (id, name, email, pin, balance, accountNumber, sortCode, status, joinDate)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run("admin-1", "Administrator", "Jobfindercorps@gmail.com", "Revelation111", 1250000, "8822 4411 0099", "20-44-99", "active", "2023-01-01");
} else if (adminExists.pin === '1111') {
  // Update old admin pin to the new one
  db.prepare("UPDATE users SET pin = ? WHERE email = ?").run("Revelation111", "Jobfindercorps@gmail.com");
}

// Seed initial deposit account if empty
const accountsCount = db.prepare("SELECT COUNT(*) as count FROM deposit_accounts").get() as { count: number };
if (accountsCount.count === 0) {
  db.prepare(`
    INSERT INTO deposit_accounts (id, bankName, accountName, accountNumber, type)
    VALUES (?, ?, ?, ?, ?)
  `).run("1", "HSBC Central Bank", "HSBC Private Banking", "8829304112", "Checking");
}

// Seed initial crypto wallets if empty
const walletsCount = db.prepare("SELECT COUNT(*) as count FROM crypto_wallets").get() as { count: number };
if (walletsCount.count === 0) {
  db.prepare(`INSERT INTO crypto_wallets (id, coin, symbol, address, network) VALUES (?, ?, ?, ?, ?)`).run("1", "Bitcoin", "BTC", "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh", "BTC");
  db.prepare(`INSERT INTO crypto_wallets (id, coin, symbol, address, network) VALUES (?, ?, ?, ?, ?)`).run("2", "Ethereum", "ETH", "0x71C7656EC7ab88b098defB751B7401B5f6d8976F", "ERC20");
  db.prepare(`INSERT INTO crypto_wallets (id, coin, symbol, address, network) VALUES (?, ?, ?, ?, ?)`).run("3", "Tether", "USDT", "0x71C7656EC7ab88b098defB751B7401B5f6d8976F", "ERC20");
}

async function startServer() {
  const app = express();
  const server = createServer(app);
  const wss = new WebSocketServer({ server });
  const PORT = 3000;

  app.use(express.json());

  const clients = new Set<WebSocket>();

  wss.on("connection", (ws) => {
    clients.add(ws);
    
    ws.on("message", (data) => {
      try {
        const message = JSON.parse(data.toString());
        if (message.type === "CHAT_MESSAGE") {
          const chatMsg = {
            id: Date.now().toString(),
            ...message.data,
            timestamp: new Date().toISOString()
          };
          
          db.prepare(`
            INSERT INTO messages (id, userId, receiverId, text, senderName, timestamp)
            VALUES (?, ?, ?, ?, ?, ?)
          `).run(chatMsg.id, chatMsg.userId, chatMsg.receiverId, chatMsg.text, chatMsg.senderName, chatMsg.timestamp);
          
          // Broadcast to all clients
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

    ws.on("close", () => clients.delete(ws));
  });

  // API to register a new user
  app.post("/api/users/register", (req, res) => {
    const { email, name, pin } = req.body;
    const existing = db.prepare("SELECT * FROM users WHERE email = ?").get(email);
    if (existing) {
      return res.status(400).json({ status: "error", message: "User already exists" });
    }

    const newUser = {
      id: Date.now().toString(),
      name,
      email,
      pin,
      balance: 1250000,
      accountNumber: '8822 4411 ' + Math.floor(1000 + Math.random() * 9000),
      sortCode: '20-44-99',
      status: 'active',
      joinDate: new Date().toISOString().split('T')[0]
    };

    db.prepare(`
      INSERT INTO users (id, name, email, pin, balance, accountNumber, sortCode, status, joinDate)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(newUser.id, newUser.name, newUser.email, newUser.pin, newUser.balance, newUser.accountNumber, newUser.sortCode, newUser.status, newUser.joinDate);

    // Broadcast new user registration
    const payload = JSON.stringify({ type: "USER_REGISTERED", data: newUser });
    clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(payload);
      }
    });

    res.json({ status: "ok", user: newUser });
  });

  // API to send a message (fallback for persistence)
  app.post("/api/messages", (req, res) => {
    const { userId, receiverId, text, senderName, isAdmin } = req.body;
    const id = Date.now().toString();
    const timestamp = new Date().toISOString();
    
    db.prepare(`
      INSERT INTO messages (id, userId, receiverId, text, senderName, timestamp)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(id, userId, receiverId, text, senderName, timestamp);
    
    res.json({ status: "ok", message: { id, userId, receiverId, text, senderName, isAdmin, timestamp } });
  });

  // API to login a user
  app.post("/api/users/login", (req, res) => {
    const { email, pin } = req.body;
    const user = db.prepare("SELECT * FROM users WHERE email = ?").get(email) as any;
    
    if (user) {
      if (pin && user.pin !== pin) {
        return res.status(401).json({ status: "error", message: "Invalid PIN" });
      }
      res.json({ status: "ok", user });
    } else {
      res.status(404).json({ status: "error", message: "User not found" });
    }
  });

  // API to get all users
  app.get("/api/users", (req, res) => {
    const users = db.prepare("SELECT * FROM users").all();
    res.json(users);
  });

  // API to get a single user
  app.get("/api/users/:id", (req, res) => {
    const user = db.prepare("SELECT * FROM users WHERE id = ?").get(req.params.id);
    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ status: "error", message: "User not found" });
    }
  });

  // API to update user details (Admin)
  app.post("/api/admin/update-user", (req, res) => {
    const { id, balance, accountNumber, sortCode, status } = req.body;
    const user = db.prepare("SELECT * FROM users WHERE id = ?").get(id) as any;
    if (user) {
      const newBalance = balance !== undefined ? Number(balance) : user.balance;
      const newAccountNumber = accountNumber !== undefined ? accountNumber : user.accountNumber;
      const newSortCode = sortCode !== undefined ? sortCode : user.sortCode;
      const newStatus = status !== undefined ? status : user.status;

      db.prepare(`
        UPDATE users SET balance = ?, accountNumber = ?, sortCode = ?, status = ? WHERE id = ?
      `).run(newBalance, newAccountNumber, newSortCode, newStatus, id);
      
      const updatedUser = db.prepare("SELECT * FROM users WHERE id = ?").get(id);
      console.log(`Broadcasting update for user ${id}: Balance ${newBalance}`);

      // Broadcast update
      const payload = JSON.stringify({ type: "USER_UPDATED", data: updatedUser });
      clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) client.send(payload);
      });

      res.json({ status: "ok", user: updatedUser });
    } else {
      res.status(404).json({ status: "error", message: "User not found" });
    }
  });

  // API to update user balance (Admin)
  app.post("/api/users/update-balance", (req, res) => {
    const { id, balance, note } = req.body;
    const user = db.prepare("SELECT * FROM users WHERE id = ?").get(id) as any;
    if (user) {
      const oldBalance = Number(user.balance);
      const newBalance = Number(balance);
      
      db.prepare("UPDATE users SET balance = ? WHERE id = ?").run(newBalance, id);
      const updatedUser = db.prepare("SELECT * FROM users WHERE id = ?").get(id) as any;
      console.log(`Broadcasting balance adjustment for user ${id}: New Balance ${newBalance}`);

      // Create a transaction record for the adjustment
      const adjustmentTx = {
        id: Date.now().toString(),
        userId: id,
        userName: updatedUser.name,
        type: newBalance > oldBalance ? 'deposit' : 'withdraw',
        amount: Math.abs(newBalance - oldBalance),
        details: JSON.stringify({ 
          method: 'System Adjustment',
          note: note || 'Manual balance adjustment by administrator'
        }),
        timestamp: new Date().toISOString(),
        status: 'completed'
      };

      db.prepare(`
        INSERT INTO transactions (id, userId, userName, type, amount, details, timestamp, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `).run(adjustmentTx.id, adjustmentTx.userId, adjustmentTx.userName, adjustmentTx.type, adjustmentTx.amount, adjustmentTx.details, adjustmentTx.timestamp, adjustmentTx.status);

      // Broadcast update
      const payload = JSON.stringify({ type: "USER_UPDATED", data: updatedUser });
      clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) client.send(payload);
      });

      res.json({ status: "ok", user: updatedUser });
    } else {
      res.status(404).json({ status: "error", message: "User not found" });
    }
  });

  // API for deposit accounts
  app.get("/api/deposit-accounts", (req, res) => {
    const accounts = db.prepare("SELECT * FROM deposit_accounts").all();
    res.json(accounts);
  });

  app.post("/api/admin/deposit-accounts", (req, res) => {
    const { bankName, accountName, accountNumber, type } = req.body;
    const id = Date.now().toString();
    db.prepare(`
      INSERT INTO deposit_accounts (id, bankName, accountName, accountNumber, type)
      VALUES (?, ?, ?, ?, ?)
    `).run(id, bankName, accountName, accountNumber, type);

    const accounts = db.prepare("SELECT * FROM deposit_accounts").all();
    const payload = JSON.stringify({ type: "DEPOSIT_ACCOUNTS_UPDATED", data: accounts });
    clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) client.send(payload);
    });

    res.json({ status: "ok", account: { id, bankName, accountName, accountNumber, type } });
  });

  app.delete("/api/admin/deposit-accounts/:id", (req, res) => {
    db.prepare("DELETE FROM deposit_accounts WHERE id = ?").run(req.params.id);

    const accounts = db.prepare("SELECT * FROM deposit_accounts").all();
    const payload = JSON.stringify({ type: "DEPOSIT_ACCOUNTS_UPDATED", data: accounts });
    clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) client.send(payload);
    });

    res.json({ status: "ok" });
  });

  // API for crypto wallets
  app.get("/api/crypto-wallets", (req, res) => {
    const wallets = db.prepare("SELECT * FROM crypto_wallets").all();
    res.json(wallets);
  });

  app.post("/api/admin/crypto-wallets", (req, res) => {
    const { coin, symbol, address, network } = req.body;
    const id = Date.now().toString();
    db.prepare(`
      INSERT INTO crypto_wallets (id, coin, symbol, address, network)
      VALUES (?, ?, ?, ?, ?)
    `).run(id, coin, symbol, address, network);

    const wallets = db.prepare("SELECT * FROM crypto_wallets").all();
    const payload = JSON.stringify({ type: "CRYPTO_WALLETS_UPDATED", data: wallets });
    clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) client.send(payload);
    });

    res.json({ status: "ok", wallet: { id, coin, symbol, address, network } });
  });

  app.put("/api/admin/crypto-wallets/:id", (req, res) => {
    const { address } = req.body;
    db.prepare("UPDATE crypto_wallets SET address = ? WHERE id = ?").run(address, req.params.id);
    const updated = db.prepare("SELECT * FROM crypto_wallets WHERE id = ?").get(req.params.id);

    const wallets = db.prepare("SELECT * FROM crypto_wallets").all();
    const payload = JSON.stringify({ type: "CRYPTO_WALLETS_UPDATED", data: wallets });
    clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) client.send(payload);
    });

    res.json({ status: "ok", wallet: updated });
  });

  app.delete("/api/admin/crypto-wallets/:id", (req, res) => {
    db.prepare("DELETE FROM crypto_wallets WHERE id = ?").run(req.params.id);

    const wallets = db.prepare("SELECT * FROM crypto_wallets").all();
    const payload = JSON.stringify({ type: "CRYPTO_WALLETS_UPDATED", data: wallets });
    clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) client.send(payload);
    });

    res.json({ status: "ok" });
  });

  // API for transactions
  app.post("/api/transactions", (req, res) => {
    const { userId, type, amount, details } = req.body;
    const numAmount = Number(amount);
    
    const user = db.prepare("SELECT * FROM users WHERE id = ?").get(userId) as any;

    if (type === 'send') {
      if (!user || Number(user.balance) < numAmount) {
        return res.status(400).json({ status: "error", message: "Insufficient balance" });
      }
      db.prepare("UPDATE users SET balance = balance - ? WHERE id = ?").run(numAmount, userId);
    }

    if (type === 'withdraw') {
      if (!user || Number(user.balance) < numAmount) {
        return res.status(400).json({ status: "error", message: "Insufficient balance" });
      }
    }

    const transaction = {
      id: Date.now().toString(),
      userId: userId,
      userName: user ? user.name : 'Unknown',
      type,
      amount: numAmount,
      details: JSON.stringify(details),
      timestamp: new Date().toISOString(),
      status: 'pending'
    };

    db.prepare(`
      INSERT INTO transactions (id, userId, userName, type, amount, details, timestamp, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(transaction.id, transaction.userId, transaction.userName, transaction.type, transaction.amount, transaction.details, transaction.timestamp, transaction.status);

    // Broadcast update for user
    const updatedUser = db.prepare("SELECT * FROM users WHERE id = ?").get(userId);
    const payload = JSON.stringify({ type: "USER_UPDATED", data: updatedUser });
    
    // Broadcast to admin if it's a request
    let requestPayload: string | null = null;
    if (type === 'withdraw') {
      requestPayload = JSON.stringify({ type: "WITHDRAWAL_REQUESTED", data: { ...transaction, details: JSON.parse(transaction.details) } });
    } else if (type === 'deposit') {
      requestPayload = JSON.stringify({ type: "DEPOSIT_REQUESTED", data: { ...transaction, details: JSON.parse(transaction.details) } });
    }

    clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(payload);
        if (requestPayload) client.send(requestPayload);
      }
    });

    res.json({ status: "ok", transaction, user: updatedUser });
  });

  app.get("/api/admin/deposits", (req, res) => {
    const deposits = db.prepare("SELECT * FROM transactions WHERE type = 'deposit' AND status = 'pending'").all();
    res.json(deposits.map((d: any) => ({ ...d, details: JSON.parse(d.details) })));
  });

  app.post("/api/admin/deposits/approve", (req, res) => {
    const { id } = req.body;
    const tx = db.prepare("SELECT * FROM transactions WHERE id = ?").get(id) as any;
    
    if (tx) {
      db.prepare("UPDATE users SET balance = balance + ? WHERE id = ?").run(tx.amount, tx.userId);
      db.prepare("UPDATE transactions SET status = 'completed' WHERE id = ?").run(id);
      
      const updatedUser = db.prepare("SELECT * FROM users WHERE id = ?").get(tx.userId);
      const updatedTx = db.prepare("SELECT * FROM transactions WHERE id = ?").get(id) as any;

      // Broadcast updates
      const userPayload = JSON.stringify({ type: "USER_UPDATED", data: updatedUser });
      const txPayload = JSON.stringify({ type: "DEPOSIT_APPROVED", data: { ...updatedTx, details: JSON.parse(updatedTx.details) } });
      
      clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(userPayload);
          client.send(txPayload);
        }
      });

      res.json({ status: "ok", transaction: updatedTx, user: updatedUser });
    } else {
      res.status(404).json({ status: "error", message: "Transaction not found" });
    }
  });

  app.post("/api/admin/deposits/reject", (req, res) => {
    const { id } = req.body;
    db.prepare("UPDATE transactions SET status = 'failed' WHERE id = ?").run(id);
    const updatedTx = db.prepare("SELECT * FROM transactions WHERE id = ?").get(id) as any;
    res.json({ status: "ok", transaction: updatedTx });
  });

  app.get("/api/admin/withdrawals", (req, res) => {
    const withdrawals = db.prepare("SELECT * FROM transactions WHERE type = 'withdraw' AND status = 'pending'").all();
    res.json(withdrawals.map((w: any) => ({ ...w, details: JSON.parse(w.details) })));
  });

  app.post("/api/admin/withdrawals/approve", (req, res) => {
    const { id } = req.body;
    const tx = db.prepare("SELECT * FROM transactions WHERE id = ?").get(id) as any;
    
    if (tx) {
      const user = db.prepare("SELECT * FROM users WHERE id = ?").get(tx.userId) as any;
      if (user.balance < tx.amount) {
        return res.status(400).json({ status: "error", message: "Insufficient balance" });
      }
      
      db.prepare("UPDATE users SET balance = balance - ? WHERE id = ?").run(tx.amount, tx.userId);
      db.prepare("UPDATE transactions SET status = 'completed' WHERE id = ?").run(id);
      
      const updatedUser = db.prepare("SELECT * FROM users WHERE id = ?").get(tx.userId);
      const updatedTx = db.prepare("SELECT * FROM transactions WHERE id = ?").get(id) as any;

      const userPayload = JSON.stringify({ type: "USER_UPDATED", data: updatedUser });
      const txPayload = JSON.stringify({ type: "WITHDRAWAL_APPROVED", data: { ...updatedTx, details: JSON.parse(updatedTx.details) } });
      
      clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(userPayload);
          client.send(txPayload);
        }
      });

      res.json({ status: "ok", transaction: updatedTx, user: updatedUser });
    } else {
      res.status(404).json({ status: "error", message: "Transaction not found" });
    }
  });

  app.post("/api/admin/withdrawals/reject", (req, res) => {
    const { id } = req.body;
    db.prepare("UPDATE transactions SET status = 'failed' WHERE id = ?").run(id);
    const updatedTx = db.prepare("SELECT * FROM transactions WHERE id = ?").get(id) as any;
    res.json({ status: "ok", transaction: updatedTx });
  });

  app.get("/api/transactions/:userId", (req, res) => {
    const txs = db.prepare("SELECT * FROM transactions WHERE userId = ? OR userId = 'current'").all(req.params.userId);
    res.json(txs.map((t: any) => ({ ...t, details: JSON.parse(t.details) })));
  });

  app.get("/api/messages/:userId", (req, res) => {
    const { userId } = req.params;
    if (userId === 'admin') {
      const msgs = db.prepare("SELECT * FROM messages").all();
      res.json(msgs);
    } else {
      const msgs = db.prepare("SELECT * FROM messages WHERE userId = ? OR receiverId = ?").all(userId, userId);
      res.json(msgs);
    }
  });

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
