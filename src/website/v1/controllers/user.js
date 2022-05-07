const { User } = require("../../../models/user");
const { recoverPersonalSignature } = require("@metamask/eth-sig-util");

// async function createUser(req, res) {
// 	try {
// 		const { sign, nonce } = req.body;
// 		const recoveredAddress = recoverPersonalSignature({
// 			data: "Please approve this message \n \nNonce:\n" + nonce,
// 			signature: sign,
// 		});

// 		const user = new User(req.body);
// 		user.address = recoveredAddress;
// 		if (!user.username) {
// 			user.username = user.address;
// 		}
// 		const token = await user.generateToken(nonce);
// 		res.status(201).send({ user, token });
// 	} catch (error) {
// 		res.send({ message: error.message });
// 	}
// }

async function signin(req, res) {
	try {
		const { sign, nonce } = req.body;
		const recoveredAddress = recoverPersonalSignature({
			data: "Please approve this message \n \nNonce:\n" + nonce,
			signature: sign,
		});

		let user = await User.findOne({ address: recoveredAddress });
		let token;
		if (!user) {
			user = new User(req.body);
			user.address = recoveredAddress;
			if (!user.username) {
				user.username = user.address;
			}
		}
		token = await user.generateToken(nonce);

		res.status(201).send({ user, token });
	} catch (error) {
		res.status(500).send({ message: error.message });
	}
}

async function getUser(req, res) {
	try {
		res.status(200).send(req.user);
	} catch (error) {
		res.status(500).send({ message: error.message });
	}
}

// async function loginUser(req, res) {
// 	try {
// 		const userAddress = recoverPersonalSignature({
// 			data: "SIGN",
// 			signature: req.body.sign,
// 		});

// 		const user = await User.findOne({ address: userAddress });

// 		if (!user) {
// 			return res.status(404).send({ message: "Invalid signature." });
// 		}

// 		const sign = await user.generateToken(req.body.sign);
// 		res.status(201).send({ user, sign });
// 	} catch (error) {
// 		res.send({ message: error.message });
// 	}
// }

module.exports = { signin, getUser };
