const express = require("express");
const router = express.Router();
const db = require("../config/db");
const { verifyToken, verifyAdmin } = require("../middleware/auth");


// 📚 Get all books (everyone)
router.get("/", (req, res) => {
  db.query("SELECT * FROM books", (err, results) => {
    if (err) return res.status(500).json(err);
    res.json(results);
  });
});


// 📊 Dashboard stats (everyone)
router.get("/stats", (req, res) => {
  const stats = {};

  db.query("SELECT COUNT(*) AS totalBooks FROM books", (err, result) => {
    if (err) return res.status(500).json(err);
    stats.totalBooks = result[0].totalBooks;

    db.query("SELECT SUM(available) AS availableBooks FROM books", (err, result) => {
      if (err) return res.status(500).json(err);
      stats.availableBooks = result[0].availableBooks;

      db.query(
        "SELECT COUNT(*) AS issuedBooks FROM issues WHERE return_date IS NULL",
        (err, result) => {
          if (err) return res.status(500).json(err);
          stats.issuedBooks = result[0].issuedBooks;

          db.query("SELECT COUNT(*) AS totalUsers FROM users", (err, result) => {
            if (err) return res.status(500).json(err);
            stats.totalUsers = result[0].totalUsers;

            res.json(stats);
          });
        }
      );
    });
  });
});


// ➕ Add book (ADMIN ONLY)
router.post("/add", verifyToken, verifyAdmin, (req, res) => {
  const { title, author, quantity } = req.body;

  db.query(
    "INSERT INTO books (title, author, quantity, available) VALUES (?, ?, ?, ?)",
    [title, author, quantity, quantity],
    (err) => {
      if (err) return res.status(500).json(err);
      res.json({ message: "Book added successfully 📚" });
    }
  );
});


// 🗑 Delete book (ADMIN ONLY)
router.delete("/delete/:id", verifyToken, verifyAdmin, (req, res) => {
  const bookId = req.params.id;

  db.query("DELETE FROM books WHERE id = ?", [bookId], (err) => {
    if (err) return res.status(500).json(err);
    res.json({ message: "Book deleted successfully 🗑" });
  });
});


// ✏ Update book quantity (ADMIN ONLY)
router.put("/update/:id", verifyToken, verifyAdmin, (req, res) => {
  const { quantity } = req.body;
  const bookId = req.params.id;

  db.query(
    "UPDATE books SET quantity = ?, available = ? WHERE id = ?",
    [quantity, quantity, bookId],
    (err) => {
      if (err) return res.status(500).json(err);
      res.json({ message: "Book updated successfully ✏" });
    }
  );
});


module.exports = router;
