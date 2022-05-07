const { Asset } = require("../../../models/asset");
const { Offer } = require("../../../models/offer");

const makeOffer = async (req, res) => {
	try {
		const offer = new Offer(req.body);
		offer.offer_from = req.user._id;
		await offer.save();
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
		const asset = await Asset.findById(offer.asset_id);
		asset.owner = req.user._id;
		offer.offer_status = "accepted";
		await offer.save();
		await asset.save();
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
		res.send(offer);
	} catch (error) {
		res.status(500).send({ message: error.message });
	}
};

module.exports = { makeOffer, acceptOffer, cancelOffer };
