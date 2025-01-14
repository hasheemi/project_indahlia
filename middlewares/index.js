const auth = require("./auth");
const uploadfile = require("./upload_file");
const storehtml = require("./store_html");
const getCoordinate = require("./coordinat");
const snippet = require("./snippet");
const summary = require("./ai_summary");
const recommendation = require("./ai_recommend");
const createQuiz = require("./ai_quiz");
const masterAuth = require("./masterAuth");
const counter = require("./counter");
const activity = require("./activity");

module.exports = {
  auth,
  uploadfile,
  snippet,
  storehtml,
  getCoordinate,
  summary,
  recommendation,
  createQuiz,
  masterAuth,
  activity,
  counter,
};
