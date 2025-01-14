const { db } = require("../helpers");
async function activity(req, res, next) {
  let data = req.body;
  let query = `INSERT INTO activity (userId, username, email, jenis, pesan) VALUES (?,?,?,?,?)`;
  let values = [
    data.userId,
    data.name,
    data.email,
    data.target,
    `${data.msg} ${data.title || data.fullname || " "}`,
  ];
  await db.query(query, values, (err) => {
    next();
  });
}
module.exports = activity;
