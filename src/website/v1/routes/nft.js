const router = require("express").Router();

const auth = require("../middlewares/auth");

const { createAsset, readAsset, transferAsset, getTotalNFTCount } = require("../controllers/nft");
const { upload } = require("../../../utils/multer");

// Create Item
router.post(
	"/nfts",
	auth,
	upload.assetImage.single("asset"),
	createAsset,
	(err, req, res, next) => {
		res.status(400).send({ error: err.message });
	}
);

// Read Item
router.get("/nfts/:contract_address/:token_id", readAsset);

// Transfer Asset
router.post("/nfts/transfer", auth, transferAsset);

// Total Count
router.get("/nfts/count", getTotalNFTCount);

module.exports = router;
