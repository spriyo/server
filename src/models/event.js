const mongoose = require("mongoose");

const EventSchema = new mongoose.Schema(
	{
		asset_id: { type: mongoose.Types.ObjectId, required: true, ref: "Asset" },
		contract_address: { type: String, required: true, trim: true },
		item_id: { type: Number, required: true },
		user_id: { type: mongoose.Types.ObjectId, required: true, ref: "User" },
		event_type: {
			type: String,
			enum: ["mint", "auction", "bid", "offer", "sale"],
			required: true,
		},
		data: { type: JSON },
	},
	{ timestamps: true }
);

const Event = new mongoose.model("Event", EventSchema);

module.exports = { Event };
