const mongoose = require("mongoose");

const EventSchema = new mongoose.Schema(
	{
		asset_id: { type: mongoose.Types.ObjectId, required: true, ref: "Asset" },
		contract_address: { type: String, required: true, trim: true },
		item_id: { type: Number, required: true },
		user_id: { type: mongoose.Types.ObjectId, required: true, ref: "User" },
		event_type: {
			type: String,
			enum: [
				"mint",
				"bid",
				"auction_create",
				"auction_update_price",
				"auction_canceled",
				"auction_settled",
				"offer_created",
				"offer_accepted",
				"offer_declined",
				"sale_created",
				"sale_update_price",
				"sale_accepted",
				"sale_canceled",
			],
			required: true,
		},
		data: { type: JSON },
	},
	{ timestamps: true }
);

const Event = new mongoose.model("Event", EventSchema);

module.exports = { Event };
