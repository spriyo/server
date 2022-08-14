const mongoose = require("mongoose");

const FollowerSchema = new mongoose.Schema(
	{
		follower_id: {
			type: mongoose.Types.ObjectId,
			required: true,
			ref: "User",
		},
		followee_id: {
			type: mongoose.Types.ObjectId,
			required: true,
			ref: "User",
		},
		follower_address: {
			type: String,
			required: true,
		},
		followee_address: {
			type: String,
			required: true,
		},
	},
	{ timestamps: true }
);

const Follower = new mongoose.model("Follower", FollowerSchema);

module.exports = { Follower };
