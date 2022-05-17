const mongoose = require("mongoose");

const TagSchema = new mongoose.Schema(
	{
		user_id: {
			type: mongoose.Types.ObjectId,
			ref: "User",
			required: true,
		},
		title: {
			type: String,
			required: true,
		},
	},
	{
		timestamps: true,
	}
);

const Tag = new mongoose.model("Tag", TagSchema);

module.exports = { Tag };
