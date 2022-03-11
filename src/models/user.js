const mongoose = require("mongoose");
const validator = require("validator");
const jwt = require("jsonwebtoken");

const UserSchema = new mongoose.Schema(
	{
		username: {
			type: String,
			trim: true,
			required: true,
			unique: true,
		},
		displayName: {
			type: String,
			trim: true,
			required: true,
		},
		address: {
			type: String,
			trim: true,
			required: true,
			unique: true,
		},
		displayImage: {
			type: String,
			default:
				"https://rendamarket.s3.ap-south-1.amazonaws.com/images/default-profile-icon.jpg",
			required: true,
		},
		phone: {
			type: Number,
			trim: true,
			validate(value) {
				if (!validator.isMobilePhone(value.toString())) {
					throw new Error("phone number is invalid");
				}
			},
		},
		email: {
			type: String,
			unique: true,
			trim: true,
			validate(value) {
				if (!validator.isEmail(value.toString())) {
					throw new Error("email is invalid");
				}
			},
		},
		lastLocation: {
			type: {
				type: String,
				enum: ["Point"],
			},
			coordinates: {
				type: [Number],
			},
		},
		disabled: {
			type: Boolean,
			required: true,
			default: false,
		},
		tokens: [
			{
				token: {
					type: String,
					required: true,
				},
				createdAt: {
					type: Date,
					required: true,
					default: new Date(),
				},
				nonce: {
					type: Number,
					required: true,
				},
			},
		],
	},
	{
		timestamps: true,
	}
);

UserSchema.methods.toJSON = function () {
	const user = this;
	const userObject = user.toObject();

	delete userObject.tokens;

	return userObject;
};

// Instance methods
UserSchema.methods.generateToken = async function () {
	const user = this;

	// Signing JWT
	const nonce = Math.floor(Math.random() * 10000000);
	const payload = {
		_id: user._id,
		wallet_address: user.address,
		nonce,
	};
	const token = jwt.sign(payload, process.env.JWT_SECRET, {
		// Adding 24hrs expire
		expiresIn: "1 days",
	});

	user.tokens = user.tokens.concat({ token, nonce });
	await user.save();
	return token;
};

const User = new mongoose.model("User", UserSchema);
// // ADD's or DROP's unique indexes
// User.syncIndexes();

module.exports = { User };
