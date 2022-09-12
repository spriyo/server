const mongoose = require("mongoose");
const validator = require("validator");

const OwnerSchema = new mongoose.Schema(
	{
		address: {
			type: String,
			required: true,
			trim: true,
			validate(value) {
				if (!validator.isEthereumAddress(value.toString())) {
					throw new Error("Invalid nft owner address");
				}
			},
		},
		token_id: {
			type: String,
			required: true,
			trim: true,
		},
		contract_address: {
			type: String,
			required: true,
			trim: true,
			validate(value) {
				if (!validator.isEthereumAddress(value.toString())) {
					throw new Error("Invalid nft contract address");
				}
			},
		},
		chain_id: {
			type: String,
			required: true,
			trim: true,
		},
		value: {
			type: String,
			required: true,
			trim: true,
		},
	},
	{ timestamps: true }
);

const Owner = new mongoose.model("Owner", OwnerSchema);

module.exports = { Owner };
