const router = require("express").Router();

const { createSale, cancelSale, buySale } = require("../controllers/sale");
const auth = require("../middlewares/auth");

router.post("/sales", auth, createSale);

router.patch("/sales/:id", auth, cancelSale);

router.patch("/sales/buy/:id", auth, buySale);

module.exports = router;
