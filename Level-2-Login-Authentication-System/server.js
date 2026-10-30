const express = require("express");
const bcrypt = require("bcryptjs");
const session = require("express-session");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = 3000;

const dataDir = path.join(__dirname, "data");
const usersFile = path.join(dataDir, "users.json");

// Create data storage if it does not exist
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir);
}

if (!fs.existsSync(usersFile)) {
  fs.writeFileSync(usersFile, JSON.stringify([]));
}

function getUsers() {
  return JSON.parse(fs.readFileSync(usersFile, "utf8"));
}

function saveUsers(users) {
  fs.writeFileSync(usersFile, JSON.stringify(users, null, 2));
}

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  session({
    secret:
      process.env.SESSION_SECRET || "change-this-secret-before-deployment",
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000,
    },
  }),
);

app.use(express.static(path.join(__dirname, "public")));

// Register
app.post("/api/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        message: "All fields are required.",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        message: "Password must be at least 6 characters.",
      });
    }

    const users = getUsers();
    const normalizedEmail = email.trim().toLowerCase();

    const existingUser = users.find((user) => user.email === normalizedEmail);

    if (existingUser) {
      return res.status(409).json({
        message: "Email is already registered.",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = {
      id: Date.now().toString(),
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
    };

    users.push(newUser);
    saveUsers(users);

    res.status(201).json({
      message: "Registration successful. Please log in.",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error." });
  }
});

// Login
app.post("/api/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required.",
      });
    }

    const users = getUsers();
    const normalizedEmail = email.trim().toLowerCase();

    const user = users.find((item) => item.email === normalizedEmail);

    if (!user) {
      return res.status(401).json({
        message: "Invalid email or password.",
      });
    }

    const passwordMatches = await bcrypt.compare(password, user.password);

    if (!passwordMatches) {
      return res.status(401).json({
        message: "Invalid email or password.",
      });
    }

    req.session.user = {
      id: user.id,
      name: user.name,
      email: user.email,
    };

    res.json({
      message: "Login successful.",
      user: req.session.user,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error." });
  }
});

// Check current session
app.get("/api/me", (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({
      message: "Please log in.",
    });
  }

  res.json({ user: req.session.user });
});

// Logout
app.post("/api/logout", (req, res) => {
  req.session.destroy((error) => {
    if (error) {
      return res.status(500).json({
        message: "Could not log out.",
      });
    }

    res.clearCookie("connect.sid");
    res.json({ message: "Logged out successfully." });
  });
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
