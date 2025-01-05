const bucket = require("../helpers/bucket");

function storehtml(req, res, next) {
  let str = req.body.myquil;
  let name = `${req.body.slug}-${req.body.nom}-${req.body.date}.txt`;
  bucket.createObject(name, Buffer.from(str), (err) => {
    if (err) {
      res.render(`${req.body.render}.ejs`, {
        err: "Failed to upload one or more files",
      });
      console.log("yu");
    } else {
      req.body.quil = `/cdn/${name}`;
      next();
    }
  });
}
module.exports = storehtml;
