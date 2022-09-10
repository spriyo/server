const router = require("express").Router();

const { registerEmail, verifyEmail } = require("../controllers/emailtoken");
const auth = require("../middlewares/auth");

router.get("/verify-email", verifyEmail);

router.post("/email-register", auth, registerEmail);

module.exports = router;
