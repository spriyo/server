const router = require("express").Router();

const {
	getActiveSales,
	getTopCreators,
	search,
} = require("../controllers/display");

router.get("/display/activesales", getActiveSales);

router.get("/display/topcreators", getTopCreators);

router.get("/display/search", search);

module.exports = router;
