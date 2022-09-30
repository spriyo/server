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

const getCollection = async (req, res) => {
	try {
		const collections = await Collection.aggregate([
			{
				$match: {
					$or: [
						{
							$expr: {
								$eq: ["$contract_address", req.params.collection_name],
							},
						},
						{ $expr: { $eq: ["$uname", req.params.collection_name] } },
					],
				},
			},
			{
				$lookup: {
					from: "contracts",
					localField: "contract_address",
					foreignField: "address",
					as: "contract",
				},
			},
			{
				$lookup: {
					from: "users",
					localField: "owners",
					foreignField: "address",
					as: "owners",
				},
			},
			{
				$project: {
					"owners.tokens": 0,
					"owners.email": 0,
				},
			},
			{
				$unwind: { path: "$contract", preserveNullAndEmptyArrays: true },
			},
		]);
		if (collections.length === 0) {
			res
				.status(404)
				.send({ message: "No collection found with the given data." });
		} else {
			res.send(collections[0]);
		}
	} catch (error) {
		res.status(500).send({ message: error.message });
	}
};

module.exports = { createCollection, getCollection };
