const router = require("express").Router();
const collections = require("./collections");
const drop = require("./drop");
const user = require("./user");

router.use(collections);
router.use(drop);
router.use(user);

module.exports = { v2WebsiteRouter: router };
