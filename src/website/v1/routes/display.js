const router = require("express").Router();

const {
	getActiveSales,
	getTopCreators,
	searchNfts,
	searchNftsByStatus,
} = require("../controllers/display");
const getUser = require("../middlewares/getUser");

router.get("/display/activesales", getActiveSales);

router.get("/display/topcreators", getTopCreators);

router.get("/display/searchnft", getUser, searchNfts);

router.get("/display/searchnftbystatus", getUser, searchNftsByStatus);

module.exports = router;
