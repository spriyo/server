const mongoose = require("mongoose");

const AssetMediaSchema = new mongoose.Schema({
	asset_id: {
		type: mongoose.Types.ObjectId,
		ref: "Asset",
		required: true,
	},
	path: {
		type: String,
		required: true,
	},
	assetPath: {
		type: String,
		required: true,
	},
	originalName: String,
	mimetype: {
		type: String,
		required: true,
	},
	size: Number,
	disabled: {
		type: Boolean,
		required: true,
		default: false,
	},
});

const AssetMedia = new mongoose.model("AssetMedia", AssetMediaSchema);

module.exports = { AssetMedia };
