const router = require("express").Router();

const auth = require("../middlewares/auth");

const { createAsset } = require("../controllers/nft");
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

module.exports = router;
