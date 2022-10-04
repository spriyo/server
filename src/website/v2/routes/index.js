const router = require("express").Router();
const collections = require("./collections");
const drop = require("./drop");

router.use(collections);
router.use(drop);

module.exports = { v2WebsiteRouter: router };
