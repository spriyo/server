const router = require("express").Router();
const { getUser, createUser, loginUser } = require("../controllers/user");
const auth = require("../middlewares/auth");

router.post("/user", createUser);

router.get("/user", auth, getUser);

// AUTH
router.post("/user/login", loginUser);

module.exports = router;
