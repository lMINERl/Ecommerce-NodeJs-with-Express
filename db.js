const mongoose = require("mongoose");
const connection =
  process.env.MONGO_URL || "mongodb://localhost:27017/ecommerce";

mongoose.connect(
  connection,
  { useCreateIndex: true, useNewUrlParser: true, autoIndex: true },
  err => {
    if (err) console.error(err);
  }
);
