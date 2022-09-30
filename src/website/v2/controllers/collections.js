const { Collection } = require("../../../models/collection");
const { Contract } = require("../../../models/contract");

const createCollection = async (req, res) => {
	try {
		const contract = new Contract(req.body);
        contract.creator = req.user.address;
		await contract.save();

		const collection = new Collection(req.body);
		collection.contract_address = contract.address;
		collection.contract_id = contract._id;

		collection.owners = [req.user.address];
		collection.image = req.files.collectionimg[0].location;
		collection.banner_image = req.files.collectionbannerimg[0].location;

		await collection.save();
		res.status(201).send(collection);
	} catch (error) {
		res.status(500).send({ message: error.message });
	}
};

module.exports = { createCollection };
