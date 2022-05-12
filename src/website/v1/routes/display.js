const router = require("express").Router();

const { getActiveSales, getTopCreators } = require("../controllers/display");

router.get("/display/activesales", getActiveSales);

router.get("/display/topcreators", getTopCreators);

module.exports = router;
