const router = require("express").Router();
const user = require("./user");
const asset = require("./asset");

router.use(user);
router.use(asset);

module.exports = { websiteRouter: router };
