const mongoose = require("mongoose");

const BidSchema = new mongoose.Schema(
	{
		auction_id: {
			type: mongoose.Types.ObjectId,
			ref: "Auction",
			required: true,
		},
		user_id: {
			type: mongoose.Types.ObjectId,
			ref: "User",
			required: true,
		},
		amount: {
			type: String,
			required: true,
		},
		accepted: {
			type: Boolean,
			required: true,
			default: false,
		},
	},
	{ timestamps: true }
);

const Bid = new mongoose.model("Bid", BidSchema);

module.exports = { Bid };
