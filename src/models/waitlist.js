const mongoose = require("mongoose");
const validator = require("validator");

const WaitListSchema = new mongoose.Schema(
	{
		email: {
			type: String,
			unique: true,
			trim: true,
			required: true,
			validate(value) {
				if (!validator.isEmail(value.toString())) {
					throw new Error("email is invalid");
				}
			},
		},
		address: {
			type: String,
		},
	},
	{
		timestamps: true,
	}
);

const WaitList = new mongoose.model("Waitlist", WaitListSchema);

module.exports = { WaitList };
