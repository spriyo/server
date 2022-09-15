const router = require("express").Router();
const auth = require("../middlewares/auth");

const {
	createAuction,
	updateAuction,
	createBid,
	cancelAuction,
	settleAuction,
	getBids,
} = require("../controllers/auction");

router.post("/auctions", auth, createAuction);

router.get("/auctions/bids", auth, getBids);

router.post("/auctions/bid", auth, createBid);

router.patch("/auctions/update/:id", auth, updateAuction);

router.patch("/auctions/cancel/:id", auth, cancelAuction);

router.patch("/auctions/settle/:id", auth, settleAuction);

module.exports = router;
