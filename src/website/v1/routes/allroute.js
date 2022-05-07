const router = require("express").Router();
const user = require("./user");
const asset = require("./asset");
const comment = require("./comment");
const offer = require("./offer");
const auction = require("./auction");
const sale = require("./sale");

router.use(user);
router.use(asset);
router.use(comment);
router.use(offer);
router.use(auction);
router.use(sale);

module.exports = { websiteRouter: router };
