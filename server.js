const cors = require("cors");
const authRoutes = require("./routes/authRoutes");
const db = require("./config/db");
const express = require("express");
const bookRoutes = require("./routes/bookRoutes");

const issueRoutes = require("./routes/issueRoutes");

const app = express();
app.use(cors());

app.use(express.json());
app.use("/books", bookRoutes);
app.use("/issue", issueRoutes);
app.use("/auth", authRoutes);


app.get("/", (req, res) => {
  res.send("Library Backend Running 🚀");
});

const PORT = 5000;
app.listen(PORT, () => {
  console.log("Server running on port", PORT);
});
