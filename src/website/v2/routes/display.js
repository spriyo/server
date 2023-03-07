const mongoose = require("mongoose");
const router = require("express").Router();
const { getStatistics } = require("../controllers/display");

router.get("/display/getStatistics", getStatistics);

module.exports = router;
