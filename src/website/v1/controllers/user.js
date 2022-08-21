const { User } = require("../../../models/user");
const { recoverPersonalSignature } = require("@metamask/eth-sig-util");
const s3 = require("../../../utils/s3");

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

const updateUser = async (req, res) => {
	let updates = Object.keys(req.body);
	const availableUpdates = ["username", "displayName", "disabled"];
	const isValid = updates.every((update) => availableUpdates.includes(update));
	if (!isValid) {
		return res.status(400).send({ message: "Invalid response received" });
	}

	try {
		const user = req.user;
		updates.forEach((update) => (user[update] = req.body[update]));
		await user.save();
		res.send(user);
	} catch (e) {
		res.status(500).send({ message: e.message });
	}
};

const updateAvatar = async function (req, res) {
	try {
		let oldurl;
		if (!req.file) {
			return res.send({ message: "add image" });
		}
		if (req.file) {
			oldurl = "assets/" + req.user.displayImage.split("/assets/")[1];
			req.user.displayImage = req.file.location;
		}
		await req.user.save();
		if (oldurl.includes("default-profile-icon.jpg")) return res.send(req.user);
		// Remove old photo
		s3.deleteObject(
			{ Key: oldurl, Bucket: process.env.AWS_BUCKET },
			function (err, data) {
				res.send(req.user);
			}
		);
	} catch (error) {
		res.status(500).send({ message: error.message });
	}
};

const getUserById = async function (req, res) {
	try {
		const regex = /^0x/gm;
		const match = req.params.id.match(regex);
		let user;
		if (match && match.length > 0) {
			user = await User.findOne({
				address: { $regex: new RegExp("^" + req.params.id + "$", "i") },
			});
		} else {
			user = await User.findById(req.params.id);
		}
		if (!user)
			return res.status(401).send({ message: "No user found with this id!" });
		res.send(user);
	} catch (error) {
		res.status(500).send({ message: error.message });
	}
};

module.exports = { signin, getUser, getUserById, updateAvatar, updateUser };
