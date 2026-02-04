const authMiddleware = require("../middleware/authMiddleware");
const express = require("express");
const router = express.Router();
const db = require("../config/db");


// ================= ISSUE BOOK =================
router.post("/issue", authMiddleware, (req, res) => {
  const { user_id, book_id } = req.body;

  db.query(
    "SELECT available FROM books WHERE id = ?",
    [book_id],
    (err, result) => {
      if (err) return res.status(500).json(err);

      if (result.length === 0) {
        return res.status(404).json({ message: "Book not found" });
      }

      if (result[0].available <= 0) {
        return res.status(400).json({ message: "Book not available" });
      }

      db.query(
        "INSERT INTO issues (user_id, book_id, issue_date) VALUES (?, ?, CURDATE())",
        [user_id, book_id],
        (err) => {
          if (err) return res.status(500).json(err);

          db.query(
            "UPDATE books SET available = available - 1 WHERE id = ?",
            [book_id],
            (err) => {
              if (err) return res.status(500).json(err);

              res.json({ message: "Book issued successfully 📖" });
            }
          );
        }
      );
    }
  );
});


// ================= RETURN BOOK =================
router.post("/return", authMiddleware, (req, res) => {
  const { issue_id } = req.body;

  db.query(
    "SELECT issue_date, book_id FROM issues WHERE id = ? AND return_date IS NULL",
    [issue_id],
    (err, result) => {
      if (err) return res.status(500).json(err);

      if (result.length === 0) {
        return res.status(400).json({ message: "Invalid issue record" });
      }

      const issueDate = new Date(result[0].issue_date);
      const today = new Date();

      const diffDays = Math.floor(
        (today - issueDate) / (1000 * 60 * 60 * 24)
      );

      let fine = 0;
      if (diffDays > 7) {
        fine = (diffDays - 7) * 10;
      }

      db.query(
        "UPDATE issues SET return_date = CURDATE(), fine = ? WHERE id = ?",
        [fine, issue_id],
        (err) => {
          if (err) return res.status(500).json(err);

          db.query(
            "UPDATE books SET available = available + 1 WHERE id = ?",
            [result[0].book_id],
            (err) => {
              if (err) return res.status(500).json(err);

              res.json({
                message: "Book returned successfully 🔁",
                fine: fine
              });
            }
          );
        }
      );
    }
  );
});
// 📜 Issue history API
router.get("/history", (req, res) => {
  const sql = `
    SELECT 
      users.name AS user,
      books.title AS book,
      issues.issue_date,
      issues.return_date,
      issues.fine
    FROM issues
    JOIN users ON issues.user_id = users.id
    JOIN books ON issues.book_id = books.id
    ORDER BY issues.issue_date DESC
  `;

  db.query(sql, (err, result) => {
    if (err) return res.status(500).json(err);
    res.json(result);
  });
});

module.exports = router;
