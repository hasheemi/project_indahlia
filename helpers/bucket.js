const ceph = require("ceph/s3");
require("dotenv").config();

// Create S3 Bucket Connection
const bucket = new ceph.Connection({
  endPoint: process.env.BUCKET_URL,
  accessKey: process.env.BUCKET_KEY,
  secretAccessKey: process.env.BUCKET_SECRET,
  bucket: "jagatirta",
});

module.exports = bucket;
