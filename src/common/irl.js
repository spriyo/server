const router = require("express").Router();
const { upload } = require("../utils/multer");
const auth = require("../website/v1/middlewares/auth");

router.post(
	"/irls/uploadimage",
	auth,
	upload.assetImage.single("displayimg"),
	async (req, res) => {
		try {
			if (!req.file) {
				return res.send({ message: "add image" });
			}

			res.send({ image: req.file.location });
		} catch (e) {
			res.status(500).send({ message: e.message });
		}
	},
	(err, req, res, next) => {
		res.status(400).send({ error: err.message });
	}
);

module.exports = router;
