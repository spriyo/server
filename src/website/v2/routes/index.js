const router = require("express").Router();
const collections = require("./collections");

router.use(collections);

module.exports = { v2WebsiteRouter: router };
