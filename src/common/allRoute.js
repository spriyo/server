const router = require("express").Router();
const nonce = require("./nonce");
const waitlist = require("./waitlist");

router.use(nonce);
router.use(waitlist);

module.exports = { commonRouter: router };
