const router = require("express").Router();

const { makeOffer, acceptOffer, cancelOffer } = require("../controllers/offer");
const auth = require("../middlewares/auth");

router.post("/offers", auth, makeOffer);

router.patch("/offers/accept/:id", auth, acceptOffer);

router.patch("/offers/cancel/:id", auth, cancelOffer);

module.exports = router;
