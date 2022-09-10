const router = require("express").Router();
const nonce = require("./nonce");
const irl = require("./irl");

router.use(nonce);
router.use(irl);

module.exports = { commonRouter: router };
