const mongoose = require("mongoose");

const AuctionSchema = new mongoose.Schema(
	{
		auction_id: {
			type: Number,
			required: true,
		},
		asset_id: {
			type: mongoose.Types.ObjectId,
			ref: "Asset",
			required: true,
		},
		item_id: {
			type: Number,
			required: true,
		},
		reserve_price: {
			type: String,
			required: true,
			default: "0",
		},
		expireAt: {
			type: Date,
			required: true,
		},
		previous_bidder: {
			type: mongoose.Types.ObjectId,
			ref: "User",
			default: null,
		},
		current_bidder: {
			type: mongoose.Types.ObjectId,
			ref: "User",
			default: null,
		},
		seller: {
			type: mongoose.Types.ObjectId,
			ref: "User",
			required: true,
		},
		contract_address: {
			type: String,
			required: true,
			trim: true,
		},
		bids: [
			{
				type: mongoose.Types.ObjectId,
				ref: "Bid",
			},
		],
		completed: {
			type: Boolean,
			required: true,
			default: false,
		},
		status: {
			type: String,
			enum: ["opened", "closed", "canceled"],
			default: "opened",
		},
	},
	{
		timestamps: true,
	}
);

const Auction = new mongoose.model("Auction", AuctionSchema);

module.exports = { Auction };
