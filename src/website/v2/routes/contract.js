const router = require("express").Router();
const { getContract } = require("../controllers/contract");

router.get("/contracts/:address", getContract);

module.exports = router;
