const { Drop } = require("../../../models/drop");
const { Collection } = require("../../../models/collection");
const { Contract } = require("../../../models/contract");
const { NFT } = require("../../../models/nft");
const { Owner } = require("../../../models/owner");
const { Event } = require("../../../models/event");

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

		const contract = await Contract.findOne({
			address: collection.contract_address,
		});

		const dropExist = await Drop.findOne({ collection_id: collection._id });
		if (dropExist)
			return res
				.status(403)
				.send({ message: "Drop exist for this collection already" });

		const drop = new Drop(req.body);
		drop.user_id = req.user._id;
		drop.image = req.file.location;

		collection.contract_address = drop.contract_address;
		contract.address = drop.contract_address;

		await contract.save();
		await collection.save();
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

const createDropNFT = async (req, res) => {
	try {
		const nft = new NFT(req.body);
		const owner = new Owner(req.body);
		owner.address = req.user.address;
		owner.nft_id = nft._id;
		await owner.save();
		await nft.save();

		// {}Event Start
		const event = new Event({
			asset_id: nft._id,
			contract_address: nft.contract_address,
			item_id: nft.token_id,
			user_id: req.user._id,
			event_type: "mint",
			data: nft,
		});
		await event.save();
		// Event End

		res.status(201).send(nft);
	} catch (error) {
		res.status(500).send({ message: error.message });
	}
};

module.exports = { createDrop, getDropByCollectionId, createDropNFT };
