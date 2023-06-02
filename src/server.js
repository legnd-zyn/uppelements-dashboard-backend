const express = require("express");
const app = express();
const bodyParser = require("body-parser");
require("dotenv").config();
const setRole = require("./middlewares/setRole");
const cors = require("cors");

if (process.env.NODE_ENV === "production") {
  const cors = require("cors");
  const corsOptions = {
    origin: true,
  };
  app.use(cors(corsOptions));
} else {
  app.use(cors());
}

app.use(bodyParser.json({ limit: "10mb" }));

app.use(setRole);

// All requests

app.use("/api", require("./routes"));

const PORT = process.env.port || 8081;

app.listen(PORT, () => {
  console.log(`Connected to port ${PORT}`);
});
