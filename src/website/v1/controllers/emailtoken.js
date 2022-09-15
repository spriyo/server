const AWS = require("aws-sdk");
const jwt = require("jsonwebtoken");
const _ = require("lodash");
const { emailTokenModel } = require("../../../models/emailtoken");
const { User } = require("../../../models/user");
const {
	errorMsgFormat,
	successFormat,
} = require("../../../utils/messageFormat");

AWS.config.update({
	accessKeyId: process.env.AWS_ACCESS_KEY_ID,
	secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
	region: "us-west-2",
});

exports.sendMail = async (to_address, emailTokenId, token) => {
	try {
		const ses = new AWS.SES();
		const url = `${process.env.APP_URL}/website/v1/verify-email?sign=${token}`;
		const params = {
			Destination: {
				ToAddresses: [to_address], // Email address/addresses that you want to send your email
			},
			ConfigurationSetName: "sampleset",
			Message: {
				Body: {
					Html: {
						// HTML Format of the email
						Charset: "UTF-8",
						Data: `<html><body><p>Hello  ${to_address}</p><p>We heard that you ready to verify your email!<\/p>\r\n    <p>Click the link to verify:<\/p>\r\n    <a href=${url}>${url}<\/a>\r\n    <p>If you don\u2019t use this link within 5 minutes, it will expire.<\/p>\r\n</body></html>`,
					},
					Text: {
						Charset: "UTF-8",
						Data: "Spriyo email verification",
					},
				},
				Subject: {
					Charset: "UTF-8",
					Data: "Spriyo email verification",
				},
			},
			Source: process.env.FROM_MAIL,
		};
		const sendEmail = ses.sendEmail(params).promise();

		sendEmail
			.then(async () => {
				// to check token was not sent or not
				await emailTokenModel.findOneAndUpdate(
					{ _id: emailTokenId },
					{ is_mail_sent: true }
				);
			})
			.catch(async (error) => {
				console.log(error);
				// to check token was not sent or not
				await emailTokenModel.findOneAndUpdate(
					{ _id: emailTokenId },
					{ is_mail_sent: false }
				);
				return error;
			});
	} catch (error) {
		console.log("error in send mail", error.message, error.stack);
		return error;
	}
};

exports.registerEmail = async (req, res) => {
	try {
		let data = req.body;
		let userData = await User.findOne({
			email: data.email,
		});

		// check already verified or not
		if (userData && userData.is_email_verified) {
			return res
				.status(200)
				.send(successFormat({}, "Email", 200, "Email already verified!"));
		}

		let emailTokenData = await emailTokenModel.findOne({
			user_id: req.user._id,
		});

		// user must try again after 5 minutes once mail was sent
		if (
			emailTokenData &&
			(new Date() - new Date(emailTokenData.updatedAt)) / 1000 < 300
		) {
			return res
				.status(429)
				.send(
					errorMsgFormat(
						"Please try again after 5 minutes",
						"register-email",
						429
					)
				);
		}

		let savedData = await new emailTokenModel({
			user_id: req.user._id,
		}).save();

		// generate token to sent
		savedData.generateToken(data.email, req.user._id);
		this.sendMail(data.email, savedData._id, savedData.token);
		return res
			.status(200)
			.send(
				successFormat(
					{},
					"register-email",
					200,
					"Verifcation link sent to your mail."
				)
			);
	} catch (error) {
		console.log("error in register email", error.message, error.stack);
		return res
			.status(500)
			.send(errorMsgFormat(error.message, "register-email", 500));
	}
};

exports.verifyEmail = async (req, res) => {
	try {
		let token = req.query.sign;
		jwt.verify(token, process.env.JWT_SECRET, async (err, data) => {
			if (err) {
				// this will throw err if token was expired
				return res
					.status(400)
					.send(errorMsgFormat("Invalid or expired", "email-verify", 400));
			} else {
				let emailTokenData = await emailTokenModel.findOne({
					_id: data._id,
					user_id: data.user_id,
					is_used: false,
				});

				if (_.isEmpty(emailTokenData)) {
					return res
						.status(400)
						.send(errorMsgFormat("Invalid or expired", "email-verify", 400));
				}
				// update whether this token already used
				await emailTokenModel.findOneAndUpdate(
					{ _id: data._id },
					{ is_used: true }
				);
				// update user table
				await User.findOneAndUpdate(
					{ _id: data.user_id },
					{ email: data.email, is_email_verified: true }
				);
				return res
					.status(200)
					.send(
						successFormat(
							{},
							"email-verify",
							200,
							"Email verified successfully"
						)
					);
			}
		});
	} catch (error) {
		console.log("errro in verify email", error.message, error.stack);
		return res
			.status(500)
			.send(errorMsgFormat(error.message, "email-verify", 500));
	}
};
