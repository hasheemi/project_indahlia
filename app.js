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
const { LRUCache } = require("lru-cache");
require("dotenv").config();
const { GoogleGenerativeAI } = require("@google/generative-ai");
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({
  model: "gemini-1.5-flash",
});
// Import Middleware
const {
  auth,
  snippet,
  storehtml,
  getCoordinate,
  summary,
  masterAuth,
} = require("./middlewares");
// Import Helpers
const { db, bucket, date } = require("./helpers");
// Import Models
const dashboardRoutes = require("./models/dashboard");
// Initialize Express Server
const app = express();
exports.app = app;
const port = process.env.APP_PORT;
// Import Middleware
const cache = new LRUCache({
  max: 25, // Maximum number of files to cache
  ttl: 1000 * 60 * 10, // Time-to-live: 10 minutes
});

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
app.use("/dashboard", dashboardRoutes);
app.use("/", (req, res, next) => {
  req.session.isLogin = req.session.isLogin || false;
  next();
});

// Main App Route
app.get("/", async (req, res) => {
  let query = "SELECT * FROM class";
  await db.query(query, (err, resu, field) => {
    if (err) {
      res.redirect("/");
    } else {
      res.render("index", {
        post: resu,
        dateFormat: date,
        status: req.session.isLogin || false,
      });
    }
  });
});

// Route For Blog Page
app.get("/blog", async (req, res) => {
  let query = "SELECT * FROM blog";
  await db.query(query, (err, resu, field) => {
    if (err) {
      res.redirect("/");
    } else {
      res.render("blog", {
        post: resu,
        dateFormat: date,
        status: req.session.isLogin || false,
      });
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
      res.render("article", {
        data: resu,
        dateFormat: date,
        status: req.session.isLogin || false,
      });
    }
  });
});
app.get("/blog/related/:id&:category", async (req, res) => {
  let query = `
  (SELECT DISTINCT * FROM blog 
   WHERE kategori = ? 
     AND id != ? 
   ORDER BY timestamp DESC 
   LIMIT 4)
  UNION
  (SELECT DISTINCT * FROM blog 
   WHERE id != ? 
   ORDER BY timestamp DESC 
   LIMIT 4)
  LIMIT 4;
`;
  let values = [req.params.category, req.params.id, req.params.id];
  await db.query(query, values, (err, resu, field) => {
    if (err) {
      res.json({ error: 404 });
    } else {
      res.json(resu);
    }
  });
});
// Route For Workshop Page
app.get("/workshop", async (req, res) => {
  let query = "SELECT * FROM class";
  await db.query(query, (err, resu, field) => {
    if (err) {
      res.redirect("/");
    } else {
      res.render("workshop", {
        post: resu,
        dateFormat: date,
        status: req.session.isLogin || false,
      });
    }
  });
});

app.get("/workshop/class/detail/:id/list", async (req, res) => {
  await db.query(
    `SELECT * FROM lesson WHERE classId = ${req.params.id}`,
    (err, resu, field) => {
      res.json(resu);
    }
  );
});
app.get("/workshop/class/detail/:id", async (req, res) => {
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
          `http://localhost:3025/workshop/class/detail/${req.params.id}/list`
        );
        const bodylist = await responselist.json();

        res.render("detail.ejs", {
          data: resu[0],
          body: bodytxt,
          list: bodylist,
          status: req.session.isLogin || false,
        });
      }
    }
  );
});

// Only For Development
app.get("/workshop/class/:classId/lesson/:id", async (req, res) => {
  await db.query(
    `SELECT * FROM lesson WHERE lessonId = ${req.params.id} AND classId = ${req.params.classId}`,
    async (err, resu, field) => {
      if (err || resu.length == 0) {
        res.redirect("/");
      } else {
        const responsetxt = await fetch(
          "http://localhost:3025" + resu[0].material
        );
        const bodytxt = await responsetxt.text();
        const responselist = await fetch(
          `http://localhost:3025/workshop/class/detail/${req.params.classId}/list`
        );
        const bodylist = await responselist.json();

        res.render("lesson.ejs", {
          data: resu[0],
          body: bodytxt,
          list: bodylist,
          status: req.session.isLogin || false,
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
  res.render("chat", { status: req.session.isLogin || false });
});
app.post("/ask", async function (req, res) {
  const result = await model.generateContent(`
    ${req.body.question}
    

    anda adalah pakar lingkungan hidup dan aktivis, jawab pertanyaan diatas , jangan sebutkan kalau anda pakar, boleh ada poin list namun jangan banyak banyak
    `);
  res.json({
    status: "success",
    res: result.response.candidates[0].content.parts[0].text,
  });
});

// Administrator Route
app.get("/admin/login", (req, res) => {
  res.render("admin/login.ejs");
});
app.post("/admin/access", masterAuth, (req, res) => {
  req.session.isAdmin = true;
  res.redirect("/master/control");
});

//Proxy For Geodata
app.get("/proxy/*", proxy, (req, res) => {
  res.send("hello");
});
app.get("/cdn/:file", async (req, res) => {
  const fileName = req.params.file;
  if (cache.has(fileName)) {
    const cachedFile = cache.get(fileName);
    res.type(fileName.split(".").pop());
    return res.send(cachedFile);
  }
  bucket.readObject(fileName, async (err, data) => {
    if (err) {
      res.status(404).send("file not found");
      console.error(err);
      return;
    }

    try {
      const mimeType = fileName.split(".").pop();
      res.type(mimeType);
      cache.set(fileName, data.buffer);
      res.send(data.buffer);
    } catch (e) {
      res.status(500).send("Server error");
      console.error(e);
    }
  });
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
                req.session.profile = data.picture;
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
        req.session.profile = data.picture;
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
