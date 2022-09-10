const { Like } = require("../../../models/like");
const { NFT } = require("../../../models/nft");

const getLikedAssets = async (req, res) => {
	try {
		const assets = await Like.find({ user_id: req.user._id })
			.populate("user_id")
			.populate("asset_id");
		res.send(assets);
	} catch (error) {
		res.status(500).send({ message: error.message });
	}
};

const likePost = async (req, res) => {
	try {
		const nft = await NFT.findById(req.params.assetId);
		if (!nft) return res.status(404).send({ message: "NFT not found" });

		const likeExist = await Like.findOne({
			asset_id: nft._id,
			user_id: req.user._id,
		});
		if (likeExist) return res.send(likeExist);

		const like = new Like({
			asset_id: nft._id,
			user_id: req.user._id,
		});
		await like.save();
		res.send(like);
	} catch (error) {
		res.status(500).ssend({ message: error.message });
	}
};

const unLikePost = async (req, res) => {
	try {
		const nft = await NFT.findById(req.params.assetId);
		if (!nft) return res.status(404).send({ message: "NFT not found" });

		const like = await Like.findOneAndDelete({
			asset_id: nft._id,
			user_id: req.user._id,
		});
		res.send(like);
	} catch (error) {
		res.status(500).ssend({ message: error.message });
	}
};

module.exports = { getLikedAssets, likePost, unLikePost };
