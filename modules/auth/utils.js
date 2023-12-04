const { nanoid } = require("nanoid");
const { createHash } = require("crypto");
const { ObjectId } = require("mongodb");
const cookieName = process.env.COOKIE_NAME || "sessionId";

const findUserByUsername = async (db, username) => db.collection("users").findOne({ username });

const findUserBySessionId = async (db, sessionId) => {
  const session = await db.collection("sessions").findOne({ sessionId }, { projection: { userId: 1 } });
  if (!session) {
    return;
  }
  return await db.collection("users").findOne({ _id: new ObjectId(session.userId) });
};

const createSession = async (db, userId) => {
  const sessionId = nanoid();
  await db.collection("sessions").insertOne({ userId, sessionId });
  return sessionId;
};

const deleteSession = async (db, sessionId) => {
  await db.collection("sessions").deleteOne({ sessionId });
};

const hashString = (str) => {
  const hash = createHash("sha256");
  return hash.update(str).digest("hex");
};

const createUser = async (db, username, password) => {
  const user = { password: hashString(password), username };
  const { insertedId } = await db.collection("users").insertOne(user);
  return { ...user, _id: insertedId };
};

const auth = () => async (req, res, next) => {
  if (!req.cookies[cookieName]) {
    return next();
  }

  const user = await findUserBySessionId(req.db, req.cookies[cookieName]);
  req.user = user;
  req.sessionId = req.cookies[cookieName];
  next();
};

const isAuth =
  (isRedirect = false) =>
  async (req, res, next) => {
    if (!req.user && isRedirect) {
      return res.redirect();
    }

    if (!req.user) {
      return res.sendStatus(401);
    }
    next();
  };
const authWs = () => async (ws, req, next) => {
  if (!req.cookies[cookieName]) {
    return next();
  }

  const user = await findUserBySessionId(req.db, req.cookies[cookieName]);
  req.user = user;
  req.sessionId = req.cookies[cookieName];
  next();
};

module.exports = {
  auth,
  deleteSession,
  createSession,
  createUser,
  hashString,
  findUserByUsername,
  isAuth,
  authWs,
};
