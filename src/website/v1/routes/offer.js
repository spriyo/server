const router = require("express").Router();

const { makeOffer, acceptOffer, cancelOffer } = require("../controllers/offer");
const auth = require("../middlewares/auth");

router.post("/offers", auth, makeOffer);

router.post("/offers/accept/:id", auth, acceptOffer);

router.post("/offers/cancel/:id", auth, cancelOffer);

module.exports = router;
