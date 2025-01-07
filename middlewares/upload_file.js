const bucket = require("../helpers/bucket");

function uploadfile(req, res, next) {
  console.log(req.files);
  if (!req.files || Object.keys(req.files).length === 0) {
    next();
  } else {
    const fileKeys = Object.keys(req.files); // Ambil semua key input file
    const uploadedFiles = [];
    console.log(fileKeys);

    fileKeys.forEach((key) => {
      const file = req.files[key];
      const type = file.name.split(".").pop(); // Ekstensi file
      const name = `${req.body.slug || "file"}-${key}-${req.body.nom}-${
        req.body.date || Date.now()
      }.${type}`;
      console.log(name);

      bucket.createObject(name, file.data, (err) => {
        if (err) {
          console.error(err);
          res.render(`${req.body.render}.ejs`, {
            err: "Failed to upload one or more files",
          });
          console.log("uyio");
        } else {
          console.log("Nono");
          uploadedFiles.push(`/cdn/${name}`);
          // Simpan path file di dalam req.body
          req.body[key] = `/cdn/${name}`;

          // Jika semua file telah diproses
          if (uploadedFiles.length === fileKeys.length) {
            next();
          }
        }
      });
    });
  }
}

module.exports = uploadfile;
