//express router
const express = require("express");
const router = express.Router();
const fetch = require("node-fetch-commonjs");
// Import middlewares
const {
  auth,
  snippet,
  storehtml,
  getCoordinate,
  uploadfile,
  summary,
  recommendation,
  createQuiz,
  counter,
  activity,
} = require("../middlewares");
// Import Helpers
const { db } = require("../helpers");

// GET routes
//define routes
router.use(auth);
router.get("/", (req, res) => {
  const { name, email, userId, profile } = req.session;
  res.render("dashboard/index", { name, email, userId, profile });
});

router.get("/article", async (req, res) => {
  const { name, email, userId, profile } = req.session;
  let query = `SELECT * FROM blog WHERE userId = ?`;
  let values = [userId];
  await db.query(query, values, (err, resu, field) => {
    if (err) {
      res.redirect("/dashboard");
    } else {
      res.render("dashboard/article/index", {
        name,
        email,
        userId,
        profile,
        post: resu,
      });
    }
  });
});
router.get("/article/add", (req, res) => {
  const { name, email, userId, profile } = req.session;
  res.render("dashboard/article/post", { name, email, userId, profile });
});
router.get("/article/:articleid/edit", async (req, res) => {
  const { name, email, userId, profile } = req.session;
  try {
    let query = `SELECT * FROM blog WHERE id = ? AND userId = ?`;
    let values = [req.params.articleid, req.session.userId];
    await db.query(query, values, async (err, resu, field) => {
      if (resu.length == 0) return res.redirect("/dashboard/article");
      const request = await fetch(`http://localhost:3025${resu[0].isi}`);
      const isi = await request.text();
      res.render("dashboard/article/edit", { data: resu[0], isi, profile });
    });
  } catch (e) {
    console.error("Error fetching article data:", err);
    res.redirect("/dashboard/article");
  }
});

router.get("/place", async (req, res) => {
  const { name, email, userId, profile } = req.session;
  let query = `SELECT * FROM place WHERE userId = ?`;
  let values = [userId];
  await db.query(query, values, (err, resu, field) => {
    if (err) {
      res.redirect("/dashboard");
    } else {
      res.render("dashboard/place/index", {
        name,
        email,
        userId,
        profile,
        post: resu,
      });
    }
  });
});

router.get("/place/add", (req, res) => {
  const { name, email, userId, profile } = req.session;
  res.render("dashboard/place/post", { name, email, userId, profile });
});

router.get("/place/:placeid/edit", auth, async (req, res) => {
  const { name, email, userId, profile } = req.session;
  try {
    let query = `SELECT * FROM place WHERE id = ?`;
    let values = [req.params.placeid];
    await db.query(query, values, (err, resu, field) => {
      if (resu.length == 0) return res.redirect("/dashboard/place");
      res.render("dashboard/place/edit", { data: resu[0], profile });
    });
  } catch (e) {
    console.error("Error fetching article data:", err);
    res.redirect("/dashboard/place");
  }
});

//todo
router.get("/report", async (req, res) => {
  const { name, email, userId, profile } = req.session;
  let query = `SELECT * FROM report WHERE userId = ?`;
  let values = [userId];
  await db.query(query, values, (err, resu, field) => {
    if (err) {
      res.redirect("/dashboard");
    } else {
      res.render("dashboard/report/index", {
        name,
        email,
        userId,
        profile,
        post: resu,
      });
    }
  });
});

router.get("/report/add", (req, res) => {
  const { name, email, userId, profile } = req.session;
  res.render("dashboard/report/post", { name, email, userId, profile });
});

router.get("/volunteer", (req, res) => {
  const { name, email, userId, profile } = req.session;
  res.render("dashboard/volunteer/index", { name, email, userId, profile });
});

router.get("/class/list", (req, res) => {
  const { userId } = req.session;
  const query = `
      SELECT 
          c.classId,
          c.judul AS className,
          c.category,
          c.thumbnail AS classThumbnail,
          l.lessonId,
          l.judul AS lessonTitle,
          l.thumbnail AS lessonThumbnail
      FROM class c
      LEFT JOIN lesson l ON c.classId = l.classId
      WHERE c.userId = ?;
    `;

  db.query(query, [userId], (error, rows) => {
    if (error) {
      console.error("Error fetching classes:", error);
      return res.status(500).json({ error: "Internal Server Error" });
    }
    const classes = rows.reduce((result, row) => {
      const {
        classId,
        className,
        category,
        classThumbnail,
        lessonId,
        lessonTitle,
        lessonThumbnail,
      } = row;
      let existingClass = result.find((cls) => cls.classId === classId);

      if (!existingClass) {
        existingClass = {
          classId,
          className,
          category,
          thumbnail: classThumbnail,
          lessons: [],
        };
        result.push(existingClass);
      }
      if (lessonId) {
        existingClass.lessons.push({
          lessonId,
          title: lessonTitle,
          thumbnail: lessonThumbnail,
        });
      }
      return result;
    }, []);
    res.json({ classes });
  });
});
router.get("/class", async (req, res) => {
  const { name, email, userId, profile } = req.session;
  res.render("dashboard/class/index", { name, email, userId, profile });
});
router.get("/class/add", (req, res) => {
  const { name, email, userId, profile } = req.session;
  res.render("dashboard/class/post", { name, email, userId, profile });
});
router.get("/class/lesson/:classid/add", async (req, res) => {
  const { name, email, userId, profile } = req.session;
  let query = `SELECT * FROM class WHERE classId = ?`;
  let values = [req.params.classid];
  await db.query(query, values, (err, resu, field) => {
    res.render("dashboard/class/lesson/post", {
      name,
      email,
      userId,
      profile,
      classId: resu[0].classId,
      className: resu[0].judul,
      banner: resu[0].banner,
    });
  });
});

//POST routes
router.post(
  "/article/add",
  uploadfile,
  storehtml,
  snippet,
  summary,
  activity,
  counter,
  async (req, res) => {
    const {
      userId,
      name,
      title,
      slug,
      quil,
      photo,
      date,
      email,
      snippet,
      category,
      scope,
      summary,
    } = req.body;
    const sql = `INSERT INTO blog (userId, username, judul, slug, isi, img, timestamp, email, cuplikan, kategori, lingkup, summary) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
    try {
      await db.query(sql, [
        userId,
        name,
        title,
        slug,
        quil,
        photo,
        date,
        email,
        snippet,
        category,
        scope,
        summary,
      ]);
      res.redirect("/dashboard/article");
    } catch (err) {
      console.error("Error inserting blog post:", err);
      res.redirect("/dashboard/article/add");
    }
  }
);
router.post(
  "/place/add",
  uploadfile,
  recommendation,
  getCoordinate,
  async (req, res) => {
    console.log(req.body);
    const data = req.body;

    try {
      // Prepare the query
      const sql = `
        INSERT INTO place
        (userId, username, nama, deskripsi, img, timestamp, email, koordinat, jenis, kondisi, link, notel, provinsi, kabupaten, recommendation) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;
      const values = [
        data.userId,
        data.name,
        data.title,
        data.desc,
        data.photo,
        data.date,
        data.email,
        data.koordinat,
        data.jenis,
        data.lingkungan,
        data.link,
        data.contact,
        data.provinsir,
        data.kabupaten,
        data.recom,
      ];
      await db.query(sql, values);
      res.redirect("/dashboard/place");
    } catch (err) {
      console.error("Error inserting place post:", err);

      res.redirect("/dashboard/place/add");
    }
  }
);

router.post("/report/add", uploadfile, storehtml, async (req, res) => {
  const data = req.body;

  try {
    // Prepare the query
    const sql = `
          INSERT INTO report 
          (userId, username, judul, slug, isi, img, timestamp, email, jenis, urgensi, copy, status,provinsi, kabupaten) 
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
    const values = [
      data.userId,
      data.name,
      data.title,
      data.slug,
      data.quil,
      data.photo,
      data.date,
      data.email,
      data.category,
      data.scope,
      data.head,
      "Belum Dibaca",
      data.provinsir,
      data.kabupaten,
    ];
    await db.query(sql, values);
    res.redirect("/dashboard/report/index");
  } catch (err) {
    console.error("Error inserting report message:", err);

    res.redirect("/dashboard/report/add");
  }
});
router.post("/volunteer/add", uploadfile, async (req, res) => {
  const data = req.body;

  try {
    // Prepare the query
    const sql = `
         INSERT INTO volunteer (username, userId, fullname, pekerjaan, pendidikan, provinsi, kabupaten, deskripsi, essay, status,email)   
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
    const values = [
      data.name,
      data.userId,
      data.fullname,
      data.work,
      data.graduate,
      data.provinsir,
      data.kabupaten,
      data.desc,
      data.essay,
      "Belum Dibaca",
      data.email,
    ];
    await db.query(sql, values);
    res.redirect("/dashboard/volunteer");
  } catch (err) {
    console.error("Error inserting Volunteer Request:", err);

    res.redirect("/dashboard/volunteer");
  }
});
router.post(
  "/class/add",
  uploadfile,
  snippet,
  summary,
  storehtml,
  async (req, res) => {
    const data = req.body;

    try {
      // Prepare the query
      const sql = `
          INSERT INTO class 
          (userId, username, judul, slug, syllabus, banner, thumbnail, timestamp, email, category, difficulty, youtube, summary) 
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
      const values = [
        data.userId,
        data.name,
        data.title,
        data.slug,
        data.quil,
        data.banner,
        data.photo,
        data.date,
        data.email,
        data.category,
        data.level,
        data.youtube,
        data.summary,
      ];
      await db.query(sql, values);
      res.redirect("/dashboard/class");
    } catch (err) {
      console.error("Error inserting blog post:", err);

      res.redirect("/dashboard/class/add");
    }
  }
);
router.post(
  "/class/lesson/add",
  uploadfile,
  snippet,
  summary,
  createQuiz,
  storehtml,
  async (req, res) => {
    const data = req.body;

    try {
      // Prepare the query
      const sql = `
          INSERT INTO lesson 
          (userId, classId, className, judul, thumbnail, youtube, quiz, material, timestamp, summary, banner) 
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
      const values = [
        data.userId,
        data.classId,
        data.className,
        data.title,
        data.photo,
        data.youtube,
        data.quiz,
        data.quil,
        data.date,
        data.summary,
        data.banner,
      ];
      await db.query(sql, values);
      res.redirect("/dashboard/class/");
    } catch (err) {
      console.error("Error inserting blog post:", err);

      res.redirect("/dashboard/class/");
    }
  }
);

// EDIT routes
router.post(
  "/article/:articleid/edit",
  storehtml,
  snippet,
  summary,
  activity,
  async (req, res) => {
    const data = req.body;
    console.log("yuio");
    console.log(req);
    const articleId = req.params.articleid;
    try {
      const sql = `
        UPDATE blog 
        SET 
          judul = ?, 
          slug = ?, 
          isi = ?, 
          cuplikan = ?, 
          kategori = ?, 
          lingkup = ?, 
          summary = ?, 
          timestamp = ? 
        WHERE id = ?
      `;
      const values = [
        data.title,
        data.slug,
        data.quil,
        data.snippet,
        data.category,
        data.scope,
        data.summary,
        data.date,
        req.params.articleid,
      ];
      await db.query(sql, values);
      res.redirect(`/dashboard/article/`);
    } catch (err) {
      console.error("Error updating blog post:", err);
      res.redirect(`/dashboard/article/${articleId}/edit`);
    }
  }
);

router.post(
  "/place/:placeid/edit",
  getCoordinate,
  activity,
  async (req, res) => {
    const data = req.body;
    const placeId = req.params.placeid;

    try {
      // Prepare the query
      const sql = `
        UPDATE place
        SET 
          userId = ?, 
          username = ?, 
          nama = ?, 
          deskripsi = ?, 
          timestamp = ?, 
          email = ?, 
          koordinat = ?, 
          jenis = ?, 
          kondisi = ?, 
          link = ?, 
          notel = ? 
        WHERE id = ?
      `;
      const values = [
        data.userId,
        data.name,
        data.title,
        data.desc,
        data.date,
        data.email,
        data.koordinat,
        data.jenis,
        data.lingkungan,
        data.link,
        data.contact,
        placeId,
      ];
      await db.query(sql, values);
      res.redirect(`/dashboard/place/`);
    } catch (err) {
      console.error("Error updating place post:", err);

      res.redirect(`/dashboard/place/${placeId}/edit`);
    }
  }
);
router.get("/article/:articleid/delete", (req, res) => {
  let query = `DELETE FROM blog WHERE id = ?`;
  let value = req.params.articleid;
  db.query(query, value, (err) => {
    if (err) res.redirect("/dashboard/article");
    res.redirect("/dashboard/article");
  });
});
router.get("/place/:placeid/delete", (req, res) => {
  let query = `DELETE FROM place WHERE id = ?`;
  let value = req.params.placeid;
  db.query(query, value, (err) => {
    if (err) res.redirect("/dashboard/place");
    res.redirect("/dashboard/place");
  });
});

module.exports = router;
