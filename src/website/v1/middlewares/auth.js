const { recoverPersonalSignature } = require("@metamask/eth-sig-util");
const { User } = require("../../../models/user");

async function auth(req, res, next) {
	try {
		const sign = req.header("Authorization").replace("Bearer ", "");
		const userAddress = recoverPersonalSignature({
			data: "SIGN",
			signature: sign,
		});

		const user = await User.findOne({
			user_address: userAddress,
			"tokens.expireAt": { $gt: new Date() },
			"tokens.sign": sign,
		});

		if (!user) {
			throw new Error();
		}
		req.user = user;
		next();
	} catch (e) {
		res.status(404).send({ message: "Please authenticate" });
	}
}

module.exports = auth;
