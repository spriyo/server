const { Asset } = require("../../../models/asset");
const { Like } = require("../../../models/like");

const getLikedAssets = async (req, res) => {
	try {
		const assets = await Like.find({ user_id: req.user._id })
			.populate("user_id")
			.populate({
				path: "asset_id",
				populate: {
					path: "medias owner",
				},
			});
		res.send(assets);
	} catch (error) {
		res.status(500).ssend({ message: error.message });
	}
};

const likePost = async (req, res) => {
	try {
		const asset = await Asset.findById(req.params.assetId);
		if (!asset) return res.status(404).send({ message: "Asset not found" });

		const likeExist = await Like.findOne({
			asset_id: asset._id,
			user_id: req.user._id,
		});
		if (likeExist) return res.send(likeExist);

		const like = new Like({
			asset_id: asset._id,
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
		const asset = await Asset.findById(req.params.assetId);
		if (!asset) return res.status(404).send({ message: "Asset not found" });

		const like = await Like.findOneAndDelete({
			asset_id: asset._id,
			user_id: req.user._id,
		});
		res.send(like);
	} catch (error) {
		res.status(500).ssend({ message: error.message });
	}
};

module.exports = { getLikedAssets, likePost, unLikePost };
