const express = require("express");
const bodyParser = require("body-parser");
const { hashString, createSession, createUser, auth, deleteSession, findUserByUsername, isAuth } = require("./utils");
const cookieName = process.env.COOKIE_NAME || "sessionId";
const httpOnly = process.env.IS_HTTP || true;

const router = express.Router();

router.post("/login", bodyParser.urlencoded({ extended: false }), async (req, res) => {
  const { username, password } = req.body;
  const user = await findUserByUsername(req.db, username);
  if (!user || user.password !== hashString(password)) {
    return res.redirect("/?authError=true");
  }

  const sessionId = await createSession(req.db, user._id);
  res.cookie(cookieName, sessionId, { httpOnly }).redirect("/");
});

router.post("/signup", bodyParser.urlencoded({ extended: false }), async (req, res) => {
  const { username, password } = req.body;

  if (username.length === 0 || password.length === 0) {
    return res.redirect("/?authError=true");
  }

  try {
    const user = await createUser(req.db, username, password);
    const sessionId = await createSession(req.db, user._id);
    res.cookie(cookieName, sessionId, { httpOnly }).redirect("/");
  } catch (error) {
    console.log(error.message);
    return res.redirect("/?authError=true");
  }
});

router.get("/logout", auth(), isAuth(true), async (req, res) => {
  await deleteSession(req.db, req.sessionId);
  res.clearCookie(cookieName).redirect("/");
});

module.exports = router;
