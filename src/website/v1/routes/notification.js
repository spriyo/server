const router = require("express").Router();
const { createNotification, getNotication, updateNotification, notificationCount } = require("../controllers/notification");
const { createNotificaitonValidation } = require("../../../validation/notification.validation");

const auth = require("../middlewares/auth");
const { validationFormat } = require("../../../utils/messageFormat");


router.get('/notification', auth,  (req, res) => {
    try {
        return getNotication(req, res)
    } catch (error) {
        return res.status(500).send(errorMsgFormat(error.message, "notification", 500));
    }
})

router.get('/notification/count',  (req, res) => {
    try {
        return notificationCount(req, res)
    } catch (error) {
        return res.status(500).send(errorMsgFormat(error.message, "notification", 500));
    }
})

router.post("/notification/create-notification", auth, (req, res) => {
    try {
        let { error } = createNotificaitonValidation(req.body);
        if (error) {
            return res.status(400).send(validationFormat(error, 'notification', 400))
        }
        return createNotification(req, res)
    } catch (error) {
        return res.status(500).send(errorMsgFormat(error.message, "notification", 500));
    }
});

router.patch("/notification/update-notification/:id", auth, (req, res) => {
    try {
        return updateNotification(req, res)
    } catch (error) {
        return res.status(500).send(errorMsgFormat(error.message, "notification", 500));
    }
});


module.exports = router;
