const express = require("express");
const router = express.Router();
const db = require("../config/db");
const bcrypt = require("bcrypt");


// Register user API
router.post("/register", async (req, res) => {
  const { name, email, password, role } = req.body;

  try {
    // Check if user already exists
    db.query(
      "SELECT id FROM users WHERE email = ?",
      [email],
      async (err, result) => {
        if (err) return res.status(500).json(err);

        if (result.length > 0) {
          return res.status(400).json({ message: "User already exists" });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insert user
        db.query(
          "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)",
          [name, email, hashedPassword, role],
          (err) => {
            if (err) return res.status(500).json(err);

            res.json({ message: "User registered successfully ✅" });
          }
        );
      }
    );
  } catch (error) {
    res.status(500).json(error);
  }
});

module.exports = router;
const jwt = require("jsonwebtoken");


// Login user API
router.post("/login", (req, res) => {
  const { email, password } = req.body;

  db.query(
    "SELECT * FROM users WHERE email = ?",
    [email],
    async (err, result) => {
      if (err) return res.status(500).json(err);

      if (result.length === 0) {
        return res.status(400).json({ message: "User not found" });
      }

      const user = result[0];

      const isMatch = await bcrypt.compare(password, user.password);

      if (!isMatch) {
        return res.status(400).json({ message: "Invalid password" });
      }

      const token = jwt.sign(
        { id: user.id, role: user.role },
        "SECRET_KEY",
        { expiresIn: "1d" }
      );

      res.json({
        message: "Login successful ✅",
        token: token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role
        }
      });
    }
  );
});
