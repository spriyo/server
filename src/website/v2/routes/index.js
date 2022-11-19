const router = require("express").Router();
const collections = require("./collections");
const drop = require("./drop");
const user = require("./user");
const contract = require("./contract");

router.use(collections);
router.use(drop);
router.use(user);
router.use(contract);

module.exports = { v2WebsiteRouter: router };
