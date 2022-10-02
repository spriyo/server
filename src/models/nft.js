const mongoose = require("mongoose");
const validator = require("validator");

const NFTSchema = new mongoose.Schema(
	{
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
		type: {
			type: String,
			required: true,
			enum: ["721", "1155"],
		},
		chain_id: {
			type: String,
			required: true,
			trim: true,
		},
		supply: {
			type: Number,
			required: true,
			default: 1,
		},
		metadata_url: {
			type: String,
		},
		metadata: {
			type: Object,
		},
		name: {
			type: String,
		},
		description: {
			type: String,
		},
		image: {
			type: String,
		},
	},
	{ timestamps: true }
);

const NFT = mongoose.model("NFT", NFTSchema);

module.exports = { NFT };
