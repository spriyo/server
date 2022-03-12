const router = require("express").Router();
const { getUser, signin } = require("../controllers/user");
const auth = require("../middlewares/auth");

router.post("/user/signin", signin);

router.get("/user", auth, getUser);

module.exports = router;
