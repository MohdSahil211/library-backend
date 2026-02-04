const mysql = require("mysql2");

const db = mysql.createConnection(
  "mysql://root:qyARCjVJlgksqTwtYunogKWztUZPmwnl@shortline.proxy.rlwy.net:54922/railway"
);

db.connect(err => {
  if (err) {
    console.error("DB connection failed:", err);
  } else {
    console.log("MySQL Connected ✅");
  }
});

module.exports = db;
