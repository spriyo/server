const mongoose = require("mongoose");

const ContractSchema = new mongoose.Schema(
	{
		address: {
			type: String,
			required: true,
			trim: true,
			validate(value) {
				if (!validator.isEthereumAddress(value.toString())) {
					throw new Error("Invalid contract address");
				}
			},
		},
		symbol: {
			type: String,
			required: true,
			trim: true,
		},
		name: {
			type: String,
			required: true,
			trim: true,
		},
		creator: {
			type: String,
			required: true,
			trim: true,
			validate(value) {
				if (!validator.isEthereumAddress(value.toString())) {
					throw new Error("Invalid creator address");
				}
			},
		},
		chain_id: {
			type: String,
			required: true,
			trim: true,
		},
	},
	{ timestamps: true }
);

const Contract = new mongoose.model("Contract", ContractSchema);

module.exports = { Contract };
