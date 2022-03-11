const { User } = require("../../../models/user");
const { recoverPersonalSignature } = require("@metamask/eth-sig-util");

async function createUser(req, res) {
	try {
		const user = new User(req.body);
		const userAddress = recoverPersonalSignature({
			data: "SIGN",
			signature: req.body.sign,
		});
		user.address = userAddress;
		if (!user.username) {
			user.username = user.address;
		}
		const token = await user.generateToken(req.body.sign);
		res.status(201).send({ user, token });
	} catch (error) {
		res.send({ message: error.message });
	}
}

async function getUser(req, res) {
	try {
		res.status(200).send(req.user);
	} catch (error) {
		res.status(500).send({ message: error.message });
	}
}

async function loginUser(req, res) {
	try {
		const userAddress = recoverPersonalSignature({
			data: "SIGN",
			signature: req.body.sign,
		});

		const user = await User.findOne({ address: userAddress });

		if (!user) {
			return res.status(404).send({ message: "Invalid signature." });
		}

		const sign = await user.generateToken(req.body.sign);

		res.status(201).send({ user, sign });
	} catch (error) {
		res.send({ message: error.message });
	}
}

module.exports = { createUser, getUser, loginUser };
