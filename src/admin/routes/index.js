const router = require("express").Router();
const asset = require("./asset");

router.use(asset);

module.exports = { adminRouter: router };
