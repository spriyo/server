const { Follower } = require("../../../models/follower");
const { User } = require("../../../models/user");

const followUser = async function (req, res) {
	try {
		const user = await User.findById(req.params.id);
		if (!user)
			return res
				.status(404)
				.send({ message: "No user found with the given Id!" });

		const followerExist = await Follower.findOne({
			follower_id: req.user._id,
			followee_id: user._id,
		});

		if (followerExist) {
			followerExist.delete();
			res.send({ message: "User unfollowed.", data: followerExist });
		} else {
			const follower = new Follower({
				follower_id: req.user._id,
				followee_id: user._id,
				follower_address: req.user.address,
				followee_address: user.address,
			});
			await follower.save();
			res.status(201).send({ message: "Following user.", data: follower });
		}
	} catch (error) {
		res.status(500).send({ message: error.message });
	}
};

const getFollowers = async function (req, res) {
	try {
		const userId = req.params.userid;
		const followers = await Follower.find({ followee_id: userId }).populate(
			"follower_id"
		);
		res.send(followers);
	} catch (error) {
		res.status(500).send({ message: error.message });
	}
};

const getFollowing = async function (req, res) {
	try {
		const userId = req.params.userid;
		const followers = await Follower.find({ follower_id: userId }).populate(
			"followee_id"
		);
		res.send(followers);
	} catch (error) {
		res.status(500).send({ message: error.message });
	}
};

module.exports = { followUser, getFollowers, getFollowing };
