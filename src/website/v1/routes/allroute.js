const router = require("express").Router();
const user = require("./user");
const asset = require("./asset");
const comment = require("./comment");

router.use(user);
router.use(asset);
router.use(comment);

module.exports = { websiteRouter: router };
