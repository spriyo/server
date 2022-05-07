const mongoose = require("mongoose");

const SaleSchema = new mongoose.Schema(
	{
		asset_id: {
			type: mongoose.Types.ObjectId,
			ref: "Asset",
			require: true,
		},
		amount: {
			type: String,
			required: true,
		},
		seller: {
			type: mongoose.Types.ObjectId,
			ref: "User",
			required: true,
		},
		buyer: {
			type: mongoose.Types.ObjectId,
			ref: "User",
		},
		sold: {
			type: Boolean,
			required: true,
			default: false,
		},
		views: {
			type: Number,
			default: 0,
			required: true,
		},
		boughtAt: {
			type: Date,
		},
		status: {
			type: String,
			enum: ["onsale", "sold", "canceled"],
			default: "onsale",
		},
	},
	{ timestamps: true }
);

const Sale = mongoose.model("Sale", SaleSchema);

module.exports = { Sale };
