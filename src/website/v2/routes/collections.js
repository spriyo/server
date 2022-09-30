const router = require("express").Router();
const auth = require("../../v1/middlewares/auth");
const {
	createCollection,
	getCollection,
} = require("../controllers/collections");
const { upload } = require("../../../utils/multer");

router.post(
	"/collections",
	auth,
	upload.collection.fields([
		{
			name: "collectionimg",
			maxCount: 1,
		},
		{
			name: "collectionbannerimg",
			maxCount: 1,
		},
	]),
	createCollection,
	(err, req, res, next) => {
		res.status(400).send({ error: err.message });
	}
);

router.get("/collections/:collection_name", getCollection);

module.exports = router;
