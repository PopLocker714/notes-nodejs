const { ObjectId } = require("mongodb");

const createTimer = async (db, { description, ownerId, isActive = true, progress = 0 }) => {
  const timer = {
    start: Date.now(),
    progress,
    end: Date.now() + progress,
    duration: progress,
    isActive,
    ownerId,
    description,
  };

  const { insertedId } = await db.collection("timers").insertOne(timer);

  return { ...timer, _id: insertedId };
};

const getTimers = async (db, { ownerId, isActive, timerId }) => {
  const whereReq = { isActive: isActive === "true" ? true : false, ownerId, _id: timerId };

  for (const key in whereReq) {
    if (whereReq[key] === undefined) {
      delete whereReq[key];
    }
  }

  const timers = await db.collection("timers").find(whereReq).toArray();
  timers.forEach((element) => {
    element.id = element._id.toString();
    element.ownerId = element.ownerId.toString();
  });

  return timers;
};

const incrementTimer = async (db) => {
  db.collection("timers").updateMany({ isActive: true }, { $inc: { progress: 1000 } });
};

let isTimerIncStart = false;

function startTimer(db) {
  if (!isTimerIncStart) {
    setInterval(() => {
      incrementTimer(db);
    }, 1000);
    isTimerIncStart = true;
  }
}

const stopTimer = async (db, { id, ownerId }) => {
  const searchParams = { ownerId: new ObjectId(ownerId), _id: new ObjectId(id) };
  const timer = await db.collection("timers").findOne(searchParams);
  const resultTimer = await db.collection("timers").findOneAndUpdate(
    searchParams,
    {
      $set: { isActive: false, end: timer.start + timer.progress, duration: timer.progress },
    },
    { returnOriginal: false, projection: { _id: 1 } }
  );

  resultTimer.id = resultTimer._id.toString();

  return resultTimer;
};

module.exports = { createTimer, getTimers, stopTimer, startTimer };
