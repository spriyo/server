const router = require("express").Router();
const auth = require("../../v1/middlewares/auth");
const { getContract, getUserContracts } = require("../controllers/contract");

router.get("/contracts", auth, getUserContracts);

router.get("/contracts/:address", getContract);

module.exports = router;
