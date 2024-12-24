const mysql = require("mysql");
require("dotenv").config();

// Create Mysql Connection
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: "indahlia",
});

module.exports = db;
