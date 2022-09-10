const { NFT } = require("../../../models/nft");
const { Event } = require("../../../models/event");
const { Owner } = require("../../../models/owners");

const createAsset = async (req, res) => {
	try {
		// Check if medias were sent through request
		if (!req.file) {
			throw new Error("Invalid response received, no files received!");
		}

		const nft = new NFT(req.body);
		nft.image = req.file.location;
		const owner= new Owner(req.body)
		owner.address = nft.owner;
		await owner.save();
		await nft.save();

		// Event Start
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

module.exports = {
	createAsset,
};
