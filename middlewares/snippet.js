const cheerio = require("cheerio");

function extractTextFromHTML(req, res, next) {
  if (!req.body.myquill) {
    res.render(`${req.body.render}.ejs`, {
      err: "Failed to make snippet",
    });
    console.log("yunn");
  }

  const $ = cheerio.load(req.body.myquil);
  req.body.content = $("body").text().trim();
  function createSnippet(text, maxLength = 100) {
    if (text.length <= maxLength) {
      return text;
    }
    return text.slice(0, maxLength).trim() + "...";
  }

  req.body.snippet = createSnippet(req.body.content, 100);
  next();
}
module.exports = extractTextFromHTML;
