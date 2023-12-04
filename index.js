require('dotenv').config();
const express = require("express");
const nunjucks = require("nunjucks");

const app = express();

nunjucks.configure("views", {
  autoescape: true,
  express: app,
});
app.set("view engine", "njk");

app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.get("/", (req, res) => {
  res.render(__dirname + "/views/index.njk");
})

if (process.env.IS_DEV === "true") {
  const port = process.env.PORT || 3000;
  app.listen(port, () => {
    console.log(`  Listening on ${process.env.IS_HTTP === "true" ? "http" : "https"}://localhost:${port}`);
  });
} else {
  module.exports = app;
}