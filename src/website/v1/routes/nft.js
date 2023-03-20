const router = require("express").Router();

const auth = require("../middlewares/auth");

const {
	readAsset,
	transferAsset,
	getTotalNFTCount,
} = require("../controllers/nft");
const getUser = require("../middlewares/getUser");

// Read Item
router.get("/nfts/:contract_address/:token_id", getUser, readAsset);

// Transfer Asset
router.post("/nfts/transfer", auth, transferAsset);

// Total Count
router.get("/nfts/count", getTotalNFTCount);

module.exports = router;
