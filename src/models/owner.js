const mongoose = require("mongoose");
const validator = require("validator");

const OwnerSchema = new mongoose.Schema(
	{
		nft_id: {
			type: mongoose.Types.ObjectId,
			ref:"NFT",
			required: true,
		},
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
		supply: {
			type: Number,
			required: true,
			trim: true,
			default: 1,
		},
	},
	{ timestamps: true }
);

const Owner = new mongoose.model("Owner", OwnerSchema);

module.exports = { Owner };
