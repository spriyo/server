const { OtpNonce } = require("../models/otpnonce");

const router = require("express").Router();

router.post("/generateNonce", async (req, res) => {
	try {
		const { address } = req.body;
		if (!address) throw new Error("Bad request");

		// 10 min = 10min * 60sec * 1000milliseconds
		const nonce = Math.floor(Math.random() * 10000000);
		const expireAt = Date.now() + 10 * 60 * 1000;

		const otpNonce = new OtpNonce({ nonce, address, expireAt });
		await otpNonce.save();
		res.send({ nonce });
	} catch (e) {
		res.status(500).send({ message: e.message });
	}
});

module.exports = router;
