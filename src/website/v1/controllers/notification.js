const {Notification: notificationSchema } =require('../../../models/notification');
const { successFormat, errorMsgFormat } = require('../../../utils/messageFormat');

exports.createNotification = async (req, res) => {
	try {
		let data = req.body;
        data.user_id = req.user._id;
        await new notificationSchema(data).save();
        return res.status(201).send(successFormat({}, 'notification', 201, 'Notification created.'));
	} catch (error) {
		console.log("errro in create notification", error.message, error.stack);
		return res
			.status(500)
			.send(errorMsgFormat(error.message, "notification", 500));
	}
};

exports.getNotication = async (req, res) => {
    try {
        let data = await notificationSchema.find({user_id: req.user._id, trash: false});
        return res.status(200).send(successFormat(data, 'notification', 200, 'Notification list.'));
    } catch (error) {
        console.log("errro in get notification", error.message, error.stack);
		return res
			.status(500)
			.send(errorMsgFormat(error.message, "notification", 500));
    }
}

exports.createNotificationInter = async(user_id, title, description, type) => {
    try {
        await new notificationSchema({user_id, title, description, type}).save();
        return
    } catch (error) {
        console.log("errro in create notification", error.message, error.stack);
        return;
    }
}

exports.updateNotification = async (req, res) => {
	try {
		let data = req.body;
        await notificationSchema.findOneAndUpdate({_id: req.params.id}, data);
        return res.status(200).send(successFormat({}, 'notification', 200, 'Notification updated.'));
	} catch (error) {
		console.log("errro in update notification", error.message, error.stack);
		return res
			.status(500)
			.send(errorMsgFormat(error.message, "notification", 500));
	}
};

exports.notificationCount = async (req, res) => {
    try {
        let count = await notificationSchema.count({user_id: req.user._id, read: false});
        return res.status(200).send(successFormat({count}, 'notification', 200, 'Notification count.'));
    } catch (error) {
        console.log("errro in update notification", error.message, error.stack);
		return res
			.status(500)
			.send(errorMsgFormat(error.message, "notification", 500));
    }
}