const router = require("express").Router();
const collections = require("./collections");
const drop = require("./drop");
const user = require("./user");
const contract = require("./contract");
const offer = require("./offer");

router.use(collections);
router.use(drop);
router.use(user);
router.use(contract);
router.use(offer);

module.exports = { v2WebsiteRouter: router };
