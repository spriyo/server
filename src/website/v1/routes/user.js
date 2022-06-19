const router = require("express").Router();
const {
	getUser,
	signin,
	updateAvatar,
	updateUser,
	getUserById,
} = require("../controllers/user");
const auth = require("../middlewares/auth");
const { upload } = require("../../../utils/multer");

router.post("/user/signin", signin);

router.get("/user", auth, getUser);

router.get("/user/:id", getUserById);

// Update User
router.patch("/user", auth, updateUser);

// Update Avatar
router.patch(
	"/user/avatar",
	auth,
	upload.displayImage.single("displayimg"),
	updateAvatar,
	(err, req, res, next) => {
		res.status(400).send({ error: err.message });
	}
);

module.exports = router;
