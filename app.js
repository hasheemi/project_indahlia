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

// Import Helper File
const db = require("./helpers/db");
const bucket = require("./helpers/bucket");

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

// Main App Route
app.get("/", (req, res) => {
  res.render("index");
});
app.get("/blog", async (req, res) => {
  let query = "SELECT * FROM blog";
  await db.query(query, (err, resu, field) => {
    if (err) {
      res.redirect("/");
    } else {
      res.render("blog", { post: resu });
    }
  });
});
app.get("/blog/post/:slug&:id", async (req, res) => {
  let query = "SELECT * FROM blog WHERE slug = ? AND id = ?";
  let values = [req.params.slug, req.params.id];
  await db.query(query, values, (err, resu, field) => {
    if (err || resu.length == 0) {
      res.redirect("/");
    } else {
      res.render("article", { data: resu });
    }
  });
});
app.get("/blog/related", async (req, res) => {
  let query = "SELECT * FROM blog";
  await db.query(query, (err, resu, field) => {
    if (err) {
      res.json({ error: 404 });
    } else {
      res.json(resu);
    }
  });
});

// Content Route from S3 Bucket
app.get("/cdn/:file", (req, res) => {
  bucket.readObject(req.params.file, async (err, data) => {
    if (err) res.status(404).send("file not found");
    res.type(req.params.file.split(".")[1]);
    res.send(data.buffer);
  });
});

// Start the Server on Port
app.listen(port, () => {
  console.log(`Server berjalan di http://localhost:${port}`);
});
