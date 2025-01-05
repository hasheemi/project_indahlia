// Import Module
const express = require("express");
const bodyParser = require("body-parser");
const session = require("express-session");
const path = require("path");
const fetch = require("node-fetch-commonjs");
const request = require("request");
const { google } = require("googleapis");
const fileUpload = require("express-fileupload");
const { createProxyMiddleware } = require("http-proxy-middleware");
const cors = require("cors");
require("dotenv").config();

// Import Middleware
const auth = require("./middlewares/auth");
const uploadfile = require("./middlewares/upload_file");
const storehtml = require("./middlewares/store_html");

// Initialize Express Server
const app = express();
const port = process.env.APP_PORT;

// Import Helper File
const db = require("./helpers/db");
const bucket = require("./helpers/bucket");

// Import Middleware
const proxy = createProxyMiddleware({
  router: (req) => new URL(req.path.substring(7)),
  pathRewrite: (path, req) => new URL(req.path.substring(7)).pathname,
  changeOrigin: true,
  logger: console,
});

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
const authClient = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  "http://localhost:3025/auth/google/callback"
);
const scopes = [
  "https://www.googleapis.com/auth/userinfo.email",
  "https://www.googleapis.com/auth/userinfo.profile",
];
const authUrl = authClient.generateAuthUrl({
  access_type: "offline",
  scope: scopes,
  include_granted_scopes: true,
});

// Main App Route
app.get("/", (req, res) => {
  res.render("index");
});

// Route For Blog Page
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
// Route For Workshop Page
app.get("/workshop", (req, res) => {
  res.render("workshop");
});

app.get("/class/detail/:id/list", async (req, res) => {
  await db.query(
    `SELECT * FROM lesson WHERE classId = ${req.params.id}`,
    (err, resu, field) => {
      res.json(resu);
    }
  );
});
app.get("/class/detail/:id", async (req, res) => {
  await db.query(
    `SELECT * FROM class WHERE classId = ${req.params.id}`,
    async (err, resu, field) => {
      if (err || resu.length == 0) {
        res.redirect("/");
      } else {
        const responsetxt = await fetch(
          "http://localhost:3025" + resu[0].syllabus
        );
        const bodytxt = await responsetxt.text();
        const responselist = await fetch(
          `http://localhost:3025/class/detail/${req.params.id}/list`
        );
        const bodylist = await responselist.json();

        res.render("detail.ejs", {
          data: resu[0],
          body: bodytxt,
          list: bodylist,
        });
      }
    }
  );
});

// Only For Development
app.get("/class/lesson/:id", async (req, res) => {
  await db.query(
    `SELECT * FROM class WHERE classId = ${req.params.id}`,
    async (err, resu, field) => {
      if (err || resu.length == 0) {
        res.redirect("/");
      } else {
        const responsetxt = await fetch(
          "http://localhost:3025" + resu[0].syllabus
        );
        const bodytxt = await responsetxt.text();
        const responselist = await fetch(
          `http://localhost:3025/class/detail/${req.params.id}/list`
        );
        const bodylist = await responselist.json();

        res.render("lesson.ejs", {
          data: resu[0],
          body: bodytxt,
          list: bodylist,
        });
      }
    }
  );
});

// Login Page
app.get("/login", (req, res) => {
  res.render("login", { isLogin: req.session.isLogin });
});

// Maps Page
app.get("/maps", async (req, res) => {
  await db.query(`SELECT * FROM place`, (err, resu, field) => {
    if (err) {
      res.redirect("/");
    } else {
      res.render("maps", { place: resu });
    }
  });
});
app.get("/maps/place/:id", async (req, res) => {
  await db.query(
    `SELECT * FROM place WHERE id = ${req.params.id}`,
    (err, resu, field) => {
      if (err || resu.length == 0) {
        res.redirect("/");
      } else {
        res.json(resu);
      }
    }
  );
});

// AI ChatBot Route
app.get("/assistant", (req, res) => {
  res.render("chat");
});

app.get("/dashboard", auth, (req, res) => {
  const { name, email, userId } = req.session;
  res.render("dashboard/index", { name, email, userId });
});
app.get("/dashboard/blog", auth, (req, res) => {
  const { name, email, userId } = req.session;
  res.render("dashboard/blog", { name, email, userId });
});
app.get("/dashboard/blog/add", auth, (req, res) => {
  const { name, email, userId } = req.session;
  res.render("dashboard/post_article", { name, email, userId });
});
app.post(
  "/dashboard/blog/add",
  auth,
  uploadfile,
  storehtml,
  async (req, res) => {
    let data = req.body;
    await db.query(
      `INSERT INTO blog (userId,judul,slug,isi,img,timestamp,email,cuplikan) VALUES ("${data.username}","${data.title}","${data.slug}","${data.url}","${data.img}","${data.date}","${data.email}","${data.cuplikan}")`,
      function (err, resu, field) {
        if (err) {
          console.log(err);
          res.redirect("/dashboard/write");
        } else {
          res.redirect("/dashboard");
        }
      }
    );
  }
);
app.get("/dashboard/maps/add", auth, (req, res) => {
  res.render("dashboard/post_place");
});
app.get("/dashboard/report", auth, (req, res) => {
  res.render("dashboard/report");
});
app.get("/dashboard/volunteer", auth, (req, res) => {
  res.render("dashboard/volunteer");
});

// Content Route from S3 Bucket
app.get("/cdn/:file", (req, res) => {
  bucket.readObject(req.params.file, async (err, data) => {
    if (err) res.status(404).send("file not found");
    res.type(req.params.file.split(".")[1]);
    res.send(data.buffer);
  });
});

//Proxy For Geodata
app.get("/proxy/*", proxy, (req, res) => {
  res.send("hello");
});

// Google Oauth Login Route
app.get("/auth/google", (req, res) => {
  res.redirect(authUrl);
});
app.get("/auth/google/callback", async (req, res) => {
  const { code } = req.query;
  const { tokens } = await authClient.getToken(code);
  authClient.setCredentials(tokens);
  const oauth2 = google.oauth2({
    auth: authClient,
    version: "v2",
  });
  const { data } = await oauth2.userinfo.get();
  await db.query(
    `INSERT INTO user (name, email, profile) VALUES (?, ?, ?)`,
    [`${data.given_name} ${data.family_name}`, data.email, data.picture],
    async function (err, resu, field) {
      if (err) {
        if (err.errno === 1062) {
          try {
            await db.query(
              `SELECT id, name FROM user WHERE email = ?`,
              [data.email],
              async function (errr, resuu, fieldd) {
                req.session.isLogin = true;
                req.session.name = resuu[0].name;
                req.session.email = data.email;
                req.session.userId = resuu[0].id;
                return res.redirect("/dashboard");
              }
            );
          } catch (queryError) {
            console.error("Error saat mencari user:", queryError.message);
            return res
              .status(500)
              .send("Terjadi error saat memproses permintaan.");
          }
        } else {
          console.error("Error saat insert:", err.message);
          return res.status(500).send("Terjadi error pada server.");
        }
      } else {
        req.session.isLogin = true;
        req.session.name = data.given_name;
        req.session.email = data.email;
        req.session.userId = resu.insertId;
        return res.redirect("/dashboard");
      }
    }
  );
});
app.get("/auth/google/logout", (req, res) => {
  if (authClient.credentials.access_token !== undefined) {
    authClient.revokeCredentials();
  }
  req.session.destroy();
  res.redirect("/");
});

// Start the Server on Port
app.listen(port, () => {
  console.log(`Server berjalan di http://localhost:${port}`);
});
