const { Event } = require("../../../models/event");

const getEvents = async (req, res) => {
	try {
		const events = await Event.find({ asset_id: req.params.asset_id });
		res.send(events);
	} catch (error) {
		res.status(500).send({ message: error.message });
	}
};

module.exports = { getEvents };
