const { upload } = require("../../../utils/multer");
const auth = require("../../v1/middlewares/auth");
const { createDrop, getDropByCollectionId } = require("../controllers/drop");

const router = require("express").Router();

router.post(
	"/drops",
	auth,
	upload.dropImage.single("image"),
	createDrop,
	(err, req, res, next) => {
		res.status(400).send({ error: err.message });
	}
);

// Get drop collection by ID
router.get("/drops/:collection_id", getDropByCollectionId);

module.exports = router;
