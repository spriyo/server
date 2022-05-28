const mongoose = require("mongoose");

const OfferSchema = new mongoose.Schema({
	offer_id: {
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
	amount: {
		type: String,
		required: true,
		trim: true,
	},
	expireAt: {
		type: Date,
		required: true,
	},
	offer_from: {
		type: mongoose.Types.ObjectId,
		ref: "User",
		required: true,
	},
	contract_address: {
		type: String,
		required: true,
		trim: true,
	},
	offer_status: {
		type: String,
		enum: ["canceled", "accepted", "expired", "none"],
		default: "none",
	},
	sold: {
		type: Boolean,
		required: true,
		default: false,
	},
});

const Offer = new mongoose.model("Offer", OfferSchema);

module.exports = { Offer };
