const { Drop } = require("../../../models/drop");
const { Collection } = require("../../../models/collection");

const createDrop = async (req, res) => {
	try {
		if (!req.file) {
			return res.status(400).send({ message: "add image" });
		}

		const collection = await Collection.findById(req.body.collection_id);
		if (!collection)
			return res
				.status(404)
				.send({ message: "No collection found with the given id." });

		const dropExist = await Drop.findOne({ collection_id: collection._id });
		if (dropExist)
			return res
				.status(403)
				.send({ message: "Drop exist for this collection already" });

		const drop = new Drop(req.body);
		drop.user_id = req.user._id;
		drop.image = req.file.location;

		drop.contract_address = collection.contract_address;
		await drop.save();

		res.status(201).send(drop);
	} catch (error) {
		res.status(500).send({ message: error.message });
	}
};

const getDropByCollectionId = async (req, res) => {
	try {
		const drop = await Drop.findOne({
			collection_id: req.params.collection_id,
		});
		if (!drop)
			return res
				.status(404)
				.send({ message: "No drop found with the given id" });

		res.send(drop);
	} catch (error) {
		res.status(500).send({ message: error.message });
	}
};

module.exports = { createDrop, getDropByCollectionId };
