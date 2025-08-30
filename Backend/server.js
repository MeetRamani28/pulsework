const express = require("express");
const app = express();
const jsonwebtoken = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const session = require("express-session");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

const db = require("./config/database-connection");
const authRoutes = require("./routes/AuthRoutes");

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(
  session({
    secret: process.env.EXPRESS_SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {
      httpOnly: true,
      secure: false,
      maxAge: 1000 * 60 * 60 * 24,
    },
  })
);

app.use("/auth", authRoutes)

app.get("/", (req, res) => {
  res.status(200).json({ message: "Welcome to the WorkChrono✨!" });
});

app.use((req, res, next) => {
  res.status(404).json({ message: "Route not found🙃" });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server is running on port http://localhost:${PORT}`);
});
