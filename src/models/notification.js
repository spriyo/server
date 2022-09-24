const mongoose = require("mongoose");

const NotificationSchema = new mongoose.Schema(
	{
		user_id: {
			type: mongoose.Types.ObjectId,
			ref: "User",
			required: true,
		},
		title: {
			type: String,
			required: true,
		},
		description: {
			type: String,
			required: true,
		},
		type: {
			type: String,
		},
		read: {
			type: Boolean,
			default: false,
		},
		url: {
			type: String,
			trim: true,
		},
	},
	{ timestamps: true }
);

const Notification = new mongoose.model("Notification", NotificationSchema);

module.exports = { Notification };
