const { getTests } = require("../controllers/test");

const router = require("express").Router();

router.get("/test", getTests);

module.exports = router;
