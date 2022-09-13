const mongoose = require("mongoose");

const LikeSchema = new mongoose.Schema(
	{
		asset_id: {
			type: mongoose.Types.ObjectId,
			ref: "NFT",
			required: true,
		},
		user_id: {
			type: mongoose.Types.ObjectId,
			ref: "User",
			required: true,
		},
	},
	{ timestamps: true }
);

const Like = new mongoose.model("Like", LikeSchema);

module.exports = { Like };
