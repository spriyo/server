const router = require("express").Router();

const { getOffers } = require("../controllers/offer");

router.get("/offers/:nft_id", getOffers);

module.exports = router;
