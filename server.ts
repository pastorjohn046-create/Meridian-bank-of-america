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
  let users: any[] = [
    {
      id: "admin-1",
      name: "Administrator",
      email: "Jobfindercorps@gmail.com",
      balance: 1250000,
      accountNumber: "8822 4411 0099",
      sortCode: "20-44-99",
      status: "active",
      joinDate: "2023-01-01",
      pin: "1111"
    }
  ];

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
    const { email } = req.body;
    if (users.find(u => u.email === email)) {
      return res.status(400).json({ status: "error", message: "User already exists" });
    }

    const newUser = {
      id: Date.now().toString(),
      ...req.body,
      balance: 0,
      accountNumber: '8822 4411 ' + Math.floor(1000 + Math.random() * 9000),
      sortCode: '20-44-99',
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

  // API to update user details (Admin)
  app.post("/api/admin/update-user", (req, res) => {
    const { id, balance, accountNumber, sortCode, status } = req.body;
    const userIndex = users.findIndex(u => u.id === id);
    if (userIndex !== -1) {
      if (balance !== undefined) users[userIndex].balance = balance;
      if (accountNumber !== undefined) users[userIndex].accountNumber = accountNumber;
      if (sortCode !== undefined) users[userIndex].sortCode = sortCode;
      if (status !== undefined) users[userIndex].status = status;
      
      const updatedUser = users[userIndex];

      // Broadcast update to the specific user
      const payload = JSON.stringify({ type: "USER_UPDATED", data: updatedUser });
      clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(payload);
        }
      });

      res.json({ status: "ok", user: updatedUser });
    } else {
      res.status(404).json({ status: "error", message: "User not found" });
    }
  });

  // API to update user balance (Admin)
  app.post("/api/users/update-balance", (req, res) => {
    const { id, balance, note } = req.body;
    const userIndex = users.findIndex(u => u.id === id);
    if (userIndex !== -1) {
      const oldBalance = Number(users[userIndex].balance);
      const newBalance = Number(balance);
      users[userIndex].balance = newBalance;
      const updatedUser = users[userIndex];

      // Create a transaction record for the adjustment
      const adjustmentTx = {
        id: Date.now().toString(),
        userId: id,
        userName: updatedUser.name,
        type: newBalance > oldBalance ? 'deposit' : 'withdraw',
        amount: Math.abs(newBalance - oldBalance),
        details: { 
          method: 'System Adjustment',
          note: note || 'Manual balance adjustment by administrator'
        },
        timestamp: new Date().toISOString(),
        status: 'completed'
      };
      transactions.push(adjustmentTx);

      // Broadcast update
      const payload = JSON.stringify({ type: "USER_UPDATED", data: updatedUser });
      const txPayload = JSON.stringify({ type: "TRANSACTION_CREATED", data: adjustmentTx });
      
      clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(payload);
          client.send(txPayload);
        }
      });

      res.json({ status: "ok", user: updatedUser });
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
    
    // Broadcast update
    const payload = JSON.stringify({ type: "DEPOSIT_ACCOUNTS_UPDATED", data: depositAccounts });
    clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(payload);
      }
    });

    res.json({ status: "ok", account: newAccount });
  });

  app.delete("/api/admin/deposit-accounts/:id", (req, res) => {
    depositAccounts = depositAccounts.filter(a => a.id !== req.params.id);
    
    // Broadcast update
    const payload = JSON.stringify({ type: "DEPOSIT_ACCOUNTS_UPDATED", data: depositAccounts });
    clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(payload);
      }
    });

    res.json({ status: "ok" });
  });

  // API for crypto wallets
  app.get("/api/crypto-wallets", (req, res) => {
    res.json(cryptoWallets);
  });

  app.post("/api/admin/crypto-wallets", (req, res) => {
    const newWallet = { id: Date.now().toString(), ...req.body };
    cryptoWallets.push(newWallet);
    
    // Broadcast update
    const payload = JSON.stringify({ type: "CRYPTO_WALLETS_UPDATED", data: cryptoWallets });
    clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(payload);
      }
    });

    res.json({ status: "ok", wallet: newWallet });
  });

  app.put("/api/admin/crypto-wallets/:id", (req, res) => {
    const { id } = req.params;
    const { address } = req.body;
    const walletIndex = cryptoWallets.findIndex(w => w.id === id);
    if (walletIndex !== -1) {
      cryptoWallets[walletIndex].address = address;
      
      // Broadcast update
      const payload = JSON.stringify({ type: "CRYPTO_WALLETS_UPDATED", data: cryptoWallets });
      clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(payload);
        }
      });

      res.json({ status: "ok", wallet: cryptoWallets[walletIndex] });
    } else {
      res.status(404).json({ status: "error", message: "Wallet not found" });
    }
  });

  app.delete("/api/admin/crypto-wallets/:id", (req, res) => {
    cryptoWallets = cryptoWallets.filter(w => w.id !== req.params.id);
    
    // Broadcast update
    const payload = JSON.stringify({ type: "CRYPTO_WALLETS_UPDATED", data: cryptoWallets });
    clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(payload);
      }
    });

    res.json({ status: "ok" });
  });

  // API for transactions
  app.post("/api/transactions", (req, res) => {
    const { userId, type, amount, details } = req.body;
    const numAmount = Number(amount);
    
    // Find user to check balance for 'send'
    const userIndex = users.findIndex(u => u.id === userId || (userId === 'current' && u.email !== 'Jobfindercorps@gmail.com'));
    const user = userIndex !== -1 ? users[userIndex] : null;

    if (type === 'send') {
      if (!user || Number(user.balance) < numAmount) {
        return res.status(400).json({ status: "error", message: "Insufficient balance" });
      }
      if (Number(user.balance) <= 0) {
        return res.status(400).json({ status: "error", message: "Balance is zero" });
      }
      
      // Deduct balance immediately for 'send'
      users[userIndex].balance = Number(users[userIndex].balance) - numAmount;
    }

    // For withdrawals, we don't deduct balance yet - admin must approve
    if (type === 'withdraw') {
      if (!user || Number(user.balance) < numAmount) {
        return res.status(400).json({ status: "error", message: "Insufficient balance" });
      }
    }

    const transaction = {
      id: Date.now().toString(),
      userId: user ? user.id : userId,
      userName: user ? user.name : 'Unknown',
      type, // 'send' | 'withdraw' | 'deposit'
      amount: numAmount,
      details,
      timestamp: new Date().toISOString(),
      status: 'pending'
    };

    transactions.push(transaction);

    // Broadcast to admin if it's a withdrawal
    if (type === 'withdraw') {
      const payload = JSON.stringify({ type: "WITHDRAWAL_REQUESTED", data: transaction });
      clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(payload);
        }
      });
    }

    // For deposits, broadcast to admin
    if (type === 'deposit') {
      const payload = JSON.stringify({ type: "DEPOSIT_REQUESTED", data: transaction });
      clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(payload);
        }
      });
    }

    res.json({ status: "ok", transaction, user: users[userIndex] });
  });

  app.get("/api/admin/deposits", (req, res) => {
    const pendingDeposits = transactions.filter(t => t.type === 'deposit' && t.status === 'pending');
    res.json(pendingDeposits);
  });

  app.post("/api/admin/deposits/approve", (req, res) => {
    const { id } = req.body;
    const txIndex = transactions.findIndex(t => t.id === id);
    
    if (txIndex !== -1) {
      const tx = transactions[txIndex];
      const userIndex = users.findIndex(u => u.id === tx.userId);
      
      if (userIndex !== -1) {
        // Add balance for deposit
        users[userIndex].balance += tx.amount;
        transactions[txIndex].status = 'completed';
        
        const updatedUser = users[userIndex];
        const updatedTx = transactions[txIndex];

        // Broadcast updates
        const userPayload = JSON.stringify({ type: "USER_UPDATED", data: updatedUser });
        const txPayload = JSON.stringify({ type: "DEPOSIT_APPROVED", data: updatedTx });
        
        clients.forEach((client) => {
          if (client.readyState === WebSocket.OPEN) {
            client.send(userPayload);
            client.send(txPayload);
          }
        });

        res.json({ status: "ok", transaction: updatedTx, user: updatedUser });
      } else {
        res.status(404).json({ status: "error", message: "User not found" });
      }
    } else {
      res.status(404).json({ status: "error", message: "Transaction not found" });
    }
  });

  app.post("/api/admin/deposits/reject", (req, res) => {
    const { id } = req.body;
    const txIndex = transactions.findIndex(t => t.id === id);
    
    if (txIndex !== -1) {
      transactions[txIndex].status = 'failed';
      const updatedTx = transactions[txIndex];

      // Broadcast update
      const txPayload = JSON.stringify({ type: "DEPOSIT_REJECTED", data: updatedTx });
      clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(txPayload);
        }
      });

      res.json({ status: "ok", transaction: updatedTx });
    } else {
      res.status(404).json({ status: "error", message: "Transaction not found" });
    }
  });

  app.get("/api/admin/withdrawals", (req, res) => {
    const pendingWithdrawals = transactions.filter(t => t.type === 'withdraw' && t.status === 'pending');
    res.json(pendingWithdrawals);
  });

  app.post("/api/admin/withdrawals/approve", (req, res) => {
    const { id } = req.body;
    const txIndex = transactions.findIndex(t => t.id === id);
    
    if (txIndex !== -1) {
      const tx = transactions[txIndex];
      const userIndex = users.findIndex(u => u.id === tx.userId);
      
      if (userIndex !== -1) {
        if (Number(users[userIndex].balance) < Number(tx.amount)) {
          return res.status(400).json({ status: "error", message: "User no longer has sufficient balance" });
        }
        
        // Deduct balance now
        users[userIndex].balance = Number(users[userIndex].balance) - Number(tx.amount);
        transactions[txIndex].status = 'completed';
        
        const updatedUser = users[userIndex];
        const updatedTx = transactions[txIndex];

        // Broadcast updates
        const userPayload = JSON.stringify({ type: "USER_UPDATED", data: updatedUser });
        const txPayload = JSON.stringify({ type: "WITHDRAWAL_APPROVED", data: updatedTx });
        
        clients.forEach((client) => {
          if (client.readyState === WebSocket.OPEN) {
            client.send(userPayload);
            client.send(txPayload);
          }
        });

        res.json({ status: "ok", transaction: updatedTx, user: updatedUser });
      } else {
        res.status(404).json({ status: "error", message: "User not found" });
      }
    } else {
      res.status(404).json({ status: "error", message: "Transaction not found" });
    }
  });

  app.post("/api/admin/withdrawals/reject", (req, res) => {
    const { id } = req.body;
    const txIndex = transactions.findIndex(t => t.id === id);
    
    if (txIndex !== -1) {
      transactions[txIndex].status = 'failed';
      const updatedTx = transactions[txIndex];

      // Broadcast update
      const txPayload = JSON.stringify({ type: "WITHDRAWAL_REJECTED", data: updatedTx });
      clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(txPayload);
        }
      });

      res.json({ status: "ok", transaction: updatedTx });
    } else {
      res.status(404).json({ status: "error", message: "Transaction not found" });
    }
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
