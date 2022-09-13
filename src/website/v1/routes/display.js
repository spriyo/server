const router = require("express").Router();

const {
	getActiveSales,
	getTopCreators,
	search,
	searchNfts,
} = require("../controllers/display");
const getUser = require("../middlewares/getUser");

router.get("/display/activesales", getActiveSales);

router.get("/display/topcreators", getTopCreators);

router.get("/display/search", getUser, search);

router.get("/display/searchnft", getUser, searchNfts);

module.exports = router;
