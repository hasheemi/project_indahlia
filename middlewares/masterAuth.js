require("dotenv").config();
function masterAuth(req, res, next) {
  if (
    req.body.username == process.env.TS_user &&
    req.body.password == process.env.TS_pass
  ) {
    if (req.body["pattern[]"].join("") == process.env.TS_patt) {
      console.log("jaak");
      next();
    }
  } else {
    res.redirect("/");
  }
}
module.exports = masterAuth;
