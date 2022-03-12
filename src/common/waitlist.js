const { WaitList } = require("../models/waitlist");

const router = require("express").Router();

router.post("/waitlist", async (req, res) => {
	try {
		const { email } = req.body;
		if (!email) throw new Error("Please enter email!");

		const waitlist = new WaitList(req.body);
		await waitlist.save();
		res.send({ email, message: "Successfully added to waitlist." });
	} catch (e) {
		res.status(500).send({ message: e.message });
	}
});

module.exports = router;
