const router = require("express").Router();
const nonce = require("./nonce");

router.use(nonce);

module.exports = { commonRouter: router };
