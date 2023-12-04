const express = require("express");
const { auth, isAuth } = require("../auth/utils");
const { createTimer, getTimers, stopTimer } = require("./utils");
const bodyParser = require("body-parser");
const pusher = require("../pusher-setup");

const router = express.Router();

// get timers
router.get("/", auth(), isAuth(), async (req, res) => {
  try {
    res.json(await getTimers(req.db, { ownerId: req.user._id, ...req.query }));
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
});

// create timer
router.post("/", auth(), isAuth(), async (req, res) => {
  try {
    const timer = await createTimer(req.db, { description: req.body.description, ownerId: req.user._id });
    timer.id = timer._id.toString();
    res.json(timer);
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
});

// stop timer by id
router.post("/:id/stop", auth(), isAuth(), async (req, res) => {
  try {
    const timer = await stopTimer(req.db, { id: req.params.id, ownerId: req.user._id });
    if (!timer) {
      return res.status(404).json({ error: "Таймер не найден" });
    }
    res.json(timer);
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
});

router.post("/trigger", auth(), isAuth(), bodyParser.urlencoded({ extended: false }), async (req, res) => {
  try {
    const { type, channel } = req.body;

    if (type === "ACTIVE_TIMERS") {
      pusher.trigger(channel, "message", {
        message: JSON.stringify({
          type: "ACTIVE_TIMERS",
          timers: await getTimers(req.db, { ownerId: req.user._id, isActive: "true" }),
        }),
      });
      res.json({ status: 200 });
    }

    if (type === "OLD_TIMERS") {
      pusher.trigger(channel, "message", {
        message: JSON.stringify({
          type: "OLD_TIMERS",
          timers: await getTimers(req.db, { ownerId: req.user._id, isActive: "false" }),
        }),
      });
      res.json({ status: 200 });
    }
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
});

module.exports = router;
