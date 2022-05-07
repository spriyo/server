const router = require("express").Router();
const auth = require("../middlewares/auth");

const {
	createAuction,
	updateAuction,
	createBid,
	cancelAuction,
	settleAuction,
} = require("../controllers/auction");

router.post("/auctions", auth, createAuction);

router.post("/auctions/bid", auth, createBid);

router.patch("/auctions/:id/update", auth, updateAuction);

router.patch("/auctions/:id/cancel", auth, cancelAuction);

router.patch("/auctions/:id/settle", auth, settleAuction);

module.exports = router;
