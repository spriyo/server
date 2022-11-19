const { Collection } = require("../../../models/collection");
const { Contract } = require("../../../models/contract");

const createCollection = async (req, res) => {
	try {
		const contract = await Contract.findOne({ address: req.body.address });

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

const updateCollection = async (req, res) => {
	try {
		const collection = await Collection.findOne({
			$or: [
				{ uname: req.params.collection_name },
				{ contract_address: req.params.collection_name },
			],
		});

		if (!collection)
			return res
				.status(404)
				.send({ message: "No collection found with given data" });
		const contract = await Contract.findOne({
			address: new RegExp("^" + collection.contract_address + "$", "i"),
		});

		if (!contract)
			return res
				.status(404)
				.send({ message: "No contract found for this collection" });

		if (req.user.address.toLowerCase() !== contract.creator.toLowerCase())
			return res
				.status(401)
				.send({ message: "Your not the owner of this collection" });

		let updates = Object.keys(req.body);
		const availableUpdates = ["name", "uname", "description", "socials"];
		const isValid = updates.every((update) =>
			availableUpdates.includes(update)
		);
		if (!isValid) {
			return res.status(400).send({ message: "Invalid response received" });
		}

		updates.forEach((update) => {
			if (update === "socials") {
				req.body.socials.forEach((k) => {
					const index = collection.socials.map((e) => e.type).indexOf(k.type);
					if (index === -1) {
						collection.socials.push(k);
					} else {
						collection.socials[index] = k;
					}
				});
			} else {
				collection[update] = req.body[update];
			}
		});

		if (req.files.collectionimg) {
			collection.image = req.files.collectionimg[0].location;
		}
		if (req.files.collectionbannerimg) {
			collection.banner_image = req.files.collectionbannerimg[0].location;
		}

		await collection.save();
		res.send(collection);
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

const getCollections = async (req, res) => {
	try {
		const user_address = req.query.user_address;
		let query = req.query.query || "";
		let queryOptions = {
			name: { $regex: query, $options: "i" },
		};
		if (user_address) {
			queryOptions.owners = user_address;
		}

		const collections = await Collection.aggregate([
			{
				$match: {
					...queryOptions,
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
			{ $skip: parseInt(!req.query.skip ? 0 : req.query.skip) },
			{ $limit: parseInt(!req.query.limit ? 10 : req.query.limit) },
		]);
		res.send(collections);
	} catch (error) {
		res.status(500).send({ message: error.message });
	}
};

module.exports = {
	createCollection,
	updateCollection,
	getCollection,
	getCollections,
};
