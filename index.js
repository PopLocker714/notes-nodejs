require('dotenv').config();
const express = require("express");
const cookieParser = require("cookie-parser");
const path = require("path");
const { isAuth, auth } = require('./modules/auth/utils');

const app = express();

require("./modules/nunjucks-setup")
  .setupNunjucks(__dirname, app)

app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());

app.use("/", require("./modules/mongo-setup"));
app.use("/", require("./modules/auth/auth"));
app.use("/api/notes", require("./modules/notes/notes"));

app.get("/", auth(), (req, res) => {
  if (req.user) {
    res.redirect("/dashboard");
    return;
  }

  res.render(__dirname + "/views/index.njk", {
    user: req.user,
    authError: req.query.authError === "true" ? "Wrong username or password" : req.query.authError,
  });
})

app.get("/dashboard", auth(), isAuth('/?authError="Unauthorized"'), (req, res) => {
  res.render(__dirname + "/views/dashboard.njk", {
    user: req.user,
  });
})

app.get("*", (req, res) => {
  res.status(404).render(__dirname + "/views/404.njk");
})

if (process.env.IS_DEV === "true") {
  const port = process.env.PORT || 3000;
  app.listen(port, () => {
    console.log(`  Listening on ${process.env.IS_HTTP === "true" ? "http" : "https"}://localhost:${port}`);
  });
} else {
  module.exports = app;
}
