const router = require("express").Router();

const {
	getActiveSales,
	getTopCreators,
	search,
} = require("../controllers/display");
const getUser = require("../middlewares/getUser");

router.get("/display/activesales", getActiveSales);

router.get("/display/topcreators", getTopCreators);

router.get("/display/search", getUser, search);

module.exports = router;
