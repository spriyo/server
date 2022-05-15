const router = require("express").Router();

const {
	createSale,
	cancelSale,
	buySale,
	updateSale,
} = require("../controllers/sale");
const auth = require("../middlewares/auth");

router.post("/sales", auth, createSale);

router.patch("/sales/cancel/:id", auth, cancelSale);

router.patch("/sales/buy/:id", auth, buySale);

router.patch("/sales/update/:id", auth, updateSale);

module.exports = router;
