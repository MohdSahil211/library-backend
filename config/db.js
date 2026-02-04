const mysql = require("mysql2");

const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "password123",
  database: "library_db"
});

db.connect((err) => {
  if (err) {
    console.log("DB connection failed ❌", err);
  } else {
    console.log("MySQL Connected ✅");
  }
});

module.exports = db;
