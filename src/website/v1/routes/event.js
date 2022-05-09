const { getEvents } = require("../controllers/event");

const router = require("express").Router();

router.get("/events/:asset_id", getEvents);

module.exports = router;
