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
		name: {
			type: String,
			required: true,
			default: "",
		},
		description: {
			type: String,
			required: true,
			default: "",
		},
		chainId: {
			type: String,
			required: true,
		},
		contractAddress: {
			type: String,
			required: true,
		},
		itemId: {
			type: Number,
			required: true,
		},
		medias: [
			{
				type: mongoose.Types.ObjectId,
				ref: "AssetMedia",
				required: true,
			},
		],
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

AssetSchema.virtual("auctions", {
	ref: "Auction",
	localField: "_id",
	foreignField: "asset_id",
});

AssetSchema.virtual("offers", {
	ref: "Offer",
	localField: "_id",
	foreignField: "asset_id",
});

AssetSchema.virtual("events", {
	ref: "Event",
	localField: "_id",
	foreignField: "asset_id",
});

const Asset = mongoose.model("Asset", AssetSchema);

module.exports = { Asset };
