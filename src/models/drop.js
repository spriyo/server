const mongoose = require("mongoose");
const validator = require("validator");

const DropSchema = new mongoose.Schema(
	{
		user_id: {
			type: mongoose.Types.ObjectId,
			ref: "User",
			required: true,
		},
		collection_id: {
			type: mongoose.Types.ObjectId,
			ref: "Collection",
			required: true,
		},
		contract_address: {
			type: String,
			required: true,
			trim: true,
			validate(value) {
				if (!validator.isEthereumAddress(value.toString())) {
					throw new Error("Invalid contract address");
				}
			},
		},
		title: {
			type: String,
		},
		description: {
			type: String,
		},
		amount: {
			type: String,
		},
		image: {
			type: String,
		},
		metadata_url: {
			type: String,
		},
		metadata: {
			type: Object,
		},
	},
	{ timestamps: true }
);

const Drop = new mongoose.model("Drop", DropSchema);

module.exports = { Drop };
