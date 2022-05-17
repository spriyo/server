const router = require("express").Router();

const auth = require("../middlewares/auth");
const { upload } = require("../../../utils/multer");

const {
	createAsset,
	readAsset,
	readAssetsUser,
	readAssets,
} = require("../controllers/asset");

// Create Item
router.post(
	"/assets",
	auth,
	upload.assetImage.array("asset", { maxCount: 1 }),
	createAsset,
	(err, req, res, next) => {
		res.status(400).send({ error: err.message });
	}
);

// Read Item
router.get("/assets/:id", readAsset);

// Read Items
router.get("/assets", readAssets);

// Read assets(user)
router.get("/assets/user/:id", readAssetsUser);

module.exports = router;
