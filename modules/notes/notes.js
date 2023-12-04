
const express = require("express");
const router = express.Router();

router.get("/", (req, res) => {

  console.log(req.body);

  res.json({ text: "Hello World!" });
})

module.exports = router;