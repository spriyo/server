const router = require("express").Router();

const auth = require("../middlewares/auth");
const { upload } = require("../../../utils/multer");

const {
	createAsset,
	readAsset,
	readAssetsUser,
	importAsset,
	transferAsset,
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

// Import Item
router.post("/assets/import", auth, importAsset);

// Transfer Asset
router.post("/assets/transfer", auth, transferAsset);

// Read Item
router.get("/assets/:id", readAsset);

// Read assets(user)
router.get("/assets/user/:id", readAssetsUser);

module.exports = router;
