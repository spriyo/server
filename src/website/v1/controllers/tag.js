const { Tag } = require("../../../models/tags");

const createTag = async (req, res) => {
	try {
		const tag = new Tag(req.body);
		tag.user_id = req.user._id;

		await tag.save();
		res.status(201).send(tag);
	} catch (error) {
		res.status(500).send({ message: error.message });
	}
};

const readTags = async (req, res) => {
	try {
		const tags = await Tag.find({
			title: {
				$regex: req.query.query,
				$options: "i",
			},
		})
			.limit(parseInt(req.query.limit || 10))
			.skip(parseInt(req.query.skip || 0));

		res.send(tags);
	} catch (error) {
		res.status(500).send({ message: error.message });
	}
};

module.exports = { createTag, readTags };
