const mongoose = require("mongoose");

const AssetSchema = new mongoose.Schema(
	{
		owner: {
			type: mongoose.Types.ObjectId,
			ref: "User",
			required: true,
		},
		created_by: {
			type: mongoose.Types.ObjectId,
			ref: "User",
			required: true,
		},
		title: {
			type: String,
			required: true,
			default: "",
		},
		description: {
			type: String,
			required: true,
			default: "",
		},
		medias: [
			{
				type: mongoose.Types.ObjectId,
				ref: "AssetMedia",
				required: true,
			},
		],
		price: {
			type: Number,
			required: true,
			default: 0,
		},
		views: {
			type: Number,
			required: true,
			default: 0,
		},
		boosted: {
			type: Boolean,
			required: true,
			default: false,
		},
	},
	{
		timestamps: true,
	}
);

const Asset = mongoose.model("Asset", AssetSchema);

module.exports = { Asset };
