const mongoose = require("mongoose");
const validator = require("validator");

const CollectionSchema = new mongoose.Schema(
	{
		contract_address: {
			type: String,
			required: true,
			trim: true,
			unique: true,
			validate(value) {
				if (!validator.isEthereumAddress(value.toString())) {
					throw new Error("Invalid contract address");
				}
			},
		},
		contract_id: {
			type: mongoose.Types.ObjectId,
			ref: "Contract",
			required: true,
			unique: true,
		},
		name: {
			type: String,
			required: true,
			trim: true,
		},
		uname: {
			type: String,
			required: true,
			trim: true,
			unique: true,
		},
		description: {
			type: String,
			default: "",
			required: true,
		},
		image: {
			type: String,
			default: "",
			required: true,
			trim: true,
		},
		banner_image: {
			type: String,
			default: "",
			required: true,
			trim: true,
		},
		owners: [
			{
				type: String,
				required: true,
				trim: true,
				validate(value) {
					if (!validator.isEthereumAddress(value.toString())) {
						throw new Error("Invalid contract address");
					}
				},
			},
		],
		socials: [
			{
				type: {
					type: String,
					enum: ["website", "discord", "twitter", "telegram", "explorer"],
					required: true,
				},
				url: {
					type: String,
					required: true,
					validate(value) {
						if (!validator.isURL(value.toString())) {
							throw new Error("Invalid url");
						}
					},
				},
			},
		],
	},
	{ timestamps: true }
);

const Collection = new mongoose.model("Collection", CollectionSchema);

module.exports = { Collection };
