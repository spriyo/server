const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcrypt");

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
				sign: {
					type: String,
					required: true,
				},
				expireAt: {
					type: Date,
					required: true,
				},
				createdAt: {
					type: Date,
					required: true,
					default: new Date(),
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
UserSchema.methods.generateToken = async function (sign) {
	const user = this;
	const currentTime = new Date();

	// Adding 24hrs expire
	currentTime.setDate(currentTime.getDate() + 1);
	const expireAt = currentTime;

	user.tokens = user.tokens.concat({ sign, expireAt });
	await user.save();
	return sign;
};

const User = new mongoose.model("User", UserSchema);
// // ADD's or DROP's unique indexes
// User.syncIndexes();

module.exports = { User };
