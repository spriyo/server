const { Notification } = require("../../../models/notification");
const {
	successFormat,
	errorMsgFormat,
} = require("../../../utils/messageFormat");

exports.createNotification = async (req, res) => {
	try {
		let data = req.body;
		data.user_id = req.user._id;
		await new Notification(data).save();
		return res
			.status(201)
			.send(successFormat({}, "notification", 201, "Notification created."));
	} catch (error) {
		console.log("error in create notification", error.message, error.stack);
		return res
			.status(500)
			.send(errorMsgFormat(error.message, "notification", 500));
	}
};

exports.createNotificationInter = async (
	user_id,
	title,
	description,
	url,
	type
) => {
	try {
		await new Notification({ user_id, title, description, url, type }).save();
		return;
	} catch (error) {
		console.log("error in create notification", error.message, error.stack);
		return;
	}
};

exports.getNotication = async (req, res) => {
	try {
		let data = await Notification.find({
			user_id: req.user._id,
		}).sort({ createdAt: -1 });

		await Notification.updateMany(
			{ user_id: req.user._id, read: false },
			{ read: true }
		);

		return res
			.status(200)
			.send(successFormat(data, "notification", 200, "Notification list."));
	} catch (error) {
		console.log("error in get notification", error.message, error.stack);
		return res
			.status(500)
			.send(errorMsgFormat(error.message, "notification", 500));
	}
};

exports.getnotificationCount = async (req, res) => {
	try {
		const count = await Notification.count({
			user_id: req.user._id,
			read: false,
		});
		res.send({ count });
	} catch (error) {
		res.status(500).send({ message: error.message });
	}
};
