// Import Module
const express = require("express");
const bodyParser = require("body-parser");
const session = require("express-session");
const path = require("path");
const fetch = require("node-fetch-commonjs");
const request = require("request");
const fileUpload = require("express-fileupload");
const cors = require("cors");
require("dotenv").config();

// Initialize Express Server
const app = express();
const port = process.env.APP_PORT;

// Helper File
const db = require("./helpers/db");

// Import Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.json());
app.use(fileUpload());
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "public")));
app.use(
  session({
    secret: "melu147ncu258r",
    saveUninitialized: true,
    expires: new Date(Date.now() + 1000 * 3600),
    resave: true,
  })
);
app.use(function (req, res, next) {
  res.locals = req.session;
  next();
});

app.get("/", (req, res) => {
  res.render("index");
});
app.get("/blog", async (req, res) => {
  await db.query(`SELECT * FROM blog`, (err, resu, field) => {
    if (err) {
      res.redirect("/");
    } else {
      res.render("blog", { post: resu });
    }
  });
});

// Start the Server on Port
app.listen(port, () => {
  console.log(`Server berjalan di http://localhost:${port}`);
});
