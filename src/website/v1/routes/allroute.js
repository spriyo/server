const router = require("express").Router();
const display = require("./display");
const user = require("./user");
const asset = require("./asset");
const comment = require("./comment");
const offer = require("./offer");
const auction = require("./auction");
const sale = require("./sale");
const tag = require("./tag");
const like = require("./like");
const follower = require("./follower");

router.use(display);
router.use(user);
router.use(asset);
router.use(comment);
router.use(offer);
router.use(auction);
router.use(sale);
router.use(tag);
router.use(like);
router.use(follower);

module.exports = { websiteRouter: router };
