const { Event } = require("../../../models/event");
const { NFT } = require("../../../models/nft");
const { Offer } = require("../../../models/offer");

const makeOffer = async (req, res) => {
	try {
		const offer = new Offer(req.body);

		const nft = await NFT.findById(req.body.asset_id);
		if (!nft) return res.send({ message: "No nft found with given id!" });

		var expireAt = new Date();
		expireAt.setDate(expireAt.getDate() + 1);
		offer.expireAt = expireAt;
		offer.offer_from = req.user.address;
		offer.contract_address = nft.contract_address;
		offer.item_id = nft.token_id;

		await offer.save();

		// {}Event Start
		const event = new Event({
			asset_id: offer.asset_id,
			contract_address: nft.contract_address,
			item_id: nft.token_id,
			user_id: req.user._id,
			event_type: "offer_created",
			data: offer,
		});
		await event.save();
		// Event End

		res.status(201).send(offer);
	} catch (error) {
		res.status(500).send({ message: error.message });
	}
};

const acceptOffer = async (req, res) => {
	try {
		const offer = await Offer.findById(req.params.id);
		if (!offer) return res.status(404).send({ message: "Invalid offer id!" });

		if (offer.expireAt.getTime() / 1000 < Date.now() / 1000) {
			offer.offer_status = "expired";
			await offer.save();
			return res.send({ message: "Offer has expired!" });
		}
		if (offer.sold)
			return res.send({ message: "Offer has been settled already!" });

		offer.sold = true;
		const nft = await NFT.findById(offer.asset_id);
		nft.owner = offer.offer_from;
		offer.offer_status = "accepted";
		await offer.save();
		await nft.save();

		// {}Event Start
		const event = new Event({
			asset_id: offer.asset_id,
			contract_address: offer.contract_address,
			item_id: offer.item_id,
			user_id: req.user._id,
			event_type: "offer_accepted",
			data: offer,
		});
		await event.save();
		// Event End

		res.send(offer);
	} catch (error) {
		res.status(500).send({ message: error.message });
	}
};

const cancelOffer = async (req, res) => {
	try {
		const offer = await Offer.findById(req.params.id);
		if (!offer) return res.status(404).send({ message: "Invalid offer id!" });

		if (offer.sold)
			return res.send({ message: "Offer has been settled already!" });

		offer.offer_status = "canceled";
		offer.sold = true;
		await offer.save();

		// {}Event Start
		const event = new Event({
			asset_id: offer.asset_id,
			contract_address: offer.contract_address,
			item_id: offer.item_id,
			user_id: req.user._id,
			event_type: "offer_canceled",
			data: offer,
		});
		await event.save();
		// Event End

		res.send(offer);
	} catch (error) {
		res.status(500).send({ message: error.message });
	}
};

module.exports = { makeOffer, acceptOffer, cancelOffer };
