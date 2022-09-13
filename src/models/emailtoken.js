const mongoose = require("mongoose");
const jwt = require('jsonwebtoken');

const emailTokenSchema = new mongoose.Schema(
	{
		user_id: {
			type: mongoose.Types.ObjectId,
			ref: "User",
			required: true,
		},
		token: {
			type: String,
			required: false,
		},
		is_mail_sent: {
			type: Boolean,
			default: false,
		},
		is_used: {
			type: Boolean,
			default: false
		}
	},
	{ timestamps: true }
);

emailTokenSchema.methods.generateToken = async function (email, user_id) {
	const emailToken = this;

	const payload = {
		_id: emailToken._id,
		user_id,
		email,
	};
	const token = jwt.sign(payload, process.env.JWT_SECRET, {
		expiresIn: 300
	});

	emailToken.token = token;
	await emailToken.save();

	await mongoose.model('EmailToken').deleteMany({user_id, _id: {$nin: [emailToken._id]}});
	return token;
};

const emailTokenModel = new mongoose.model("EmailToken", emailTokenSchema);

module.exports = { emailTokenModel };
