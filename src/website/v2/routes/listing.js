const { Listing } = require("../../../models/listing");
const router = require("express").Router();

router.get("/listing/:contract_address/:token_id", async (req, res) => {
	try {
		const listings = await Listing.find({
			contract_address: req.params.contract_address,
			token_id: req.params.token_id,
			status: "create",
		}).exec();
		res.send(listings);
	} catch (error) {
		res.status(500).send({ message: error.message });
	}
});

module.exports = router;
