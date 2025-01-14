const { db } = require("../helpers");
async function incrementCounter(req, res, next) {
  const validColumns = [
    "article_count",
    "place_count",
    "report_count",
    "class_count",
  ];
  let data = req.body;
  let columnName = `${data.target}_count`;
  if (!validColumns.includes(columnName)) {
    throw new Error(`Kolom '${columnName}' tidak valid.`);
  }

  try {
    const query = `
            UPDATE user
            SET ${columnName} = ${columnName} + 1
            WHERE id = ?;
        `;

    // Eksekusi query dengan parameter
    await db.query(query, [data.userId]);
    console.log(
      `Kolom ${columnName} berhasil diperbarui untuk user ID: ${data.userId}`
    );
    next();
  } catch (error) {
    res.render(`${req.body.render}.ejs`, {
      err: "Failed to insert counter",
    });
    console.log("accu");
  }
}

module.exports = incrementCounter;
