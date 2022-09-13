const { Sale } = require("../../../models/sale");
const { NFT } = require("../../../models/nft");
const { Event } = require("../../../models/event");

const createSale = async (req, res) => {
	try {
		const sale = new Sale(req.body);
		sale.seller = req.user._id;

		const isSaleExist = await Sale.findOne({
			asset_id: sale.asset_id,
			sold: false,
		});
		if (isSaleExist)
			return res
				.status(404)
				.send({ message: "This asset is already listed for sale!" });

		const nft = await NFT.findById(req.body.asset_id);
		if (!nft) return res.send({ message: "No nft found with given id!" });

		if (req.user.address.toLowerCase() !== nft.owner.toLowerCase())
			return res
				.status(401)
				.send({ message: "Only the nft owner can list it for sale!" });

		await sale.save();

		// {}Event Start
		const event = new Event({
			asset_id: nft._id,
			contract_address: nft.contract_address,
			item_id: nft.token_id,
			user_id: sale.seller,
			event_type: "sale_created",
			data: sale,
		});
		await event.save();
		// Event End

		res.status(201).send(sale);
	} catch (error) {
		res.status(500).send({ message: error.message });
	}
};

const cancelSale = async (req, res) => {
	try {
		const sale = await Sale.findOne({
			_id: req.params.id,
			status: "onsale",
			sold: false,
		});
		if (!sale)
			return res
				.status(404)
				.send({ message: "Invalid id or sale might have been canceled/sold." });

		if (!sale.seller.equals(req.user._id))
			return res
				.status(401)
				.send({ message: "Only seller can cancel the sale!" });

		const nft = await NFT.findById(sale.asset_id);
		sale.status = "canceled";
		sale.sold = true;
		await sale.save();

		// {}Event Start
		const event = new Event({
			asset_id: nft._id,
			contract_address: nft.contract_address,
			item_id: nft.token_id,
			user_id: sale.seller,
			event_type: "sale_canceled",
			data: sale,
		});
		await event.save();
		// Event End

		res.send(sale);
	} catch (error) {
		res.status(500).send({ message: error.message });
	}
};

const updateSale = async (req, res) => {
	try {
		const sale = await Sale.findOne({
			_id: req.params.id,
			status: "onsale",
			sold: false,
		});
		if (!sale)
			return res
				.status(404)
				.send({ message: "Invalid id or sale might have been canceled/sold." });

		if (!sale.seller.equals(req.user._id))
			return res
				.status(401)
				.send({ message: "Only seller can update the sale!" });

		const nft = await NFT.findById(sale.asset_id);
		sale.amount = req.body.amount;
		await sale.save();

		// {}Event Start
		const event = new Event({
			asset_id: nft._id,
			contract_address: nft.contract_address,
			item_id: nft.token_id,
			user_id: sale.seller,
			event_type: "sale_update_price",
			data: sale,
		});
		await event.save();
		// Event End

		res.send(sale);
	} catch (error) {
		res.status(500).send({ message: error.message });
	}
};

const buySale = async (req, res) => {
	try {
		const sale = await Sale.findOne({
			_id: req.params.id,
			status: "onsale",
			sold: false,
		});
		if (!sale)
			return res
				.status(404)
				.send({ message: "Invalid id or sale might have been canceled/sold." });

		const nft = await NFT.findById(sale.asset_id);
		nft.owner = req.user.address;

		sale.buyer = req.user._id;
		sale.status = "sold";
		sale.sold = true;
		await sale.save();
		await nft.save();

		// {}Event Start
		const event = new Event({
			asset_id: nft._id,
			contract_address: nft.contract_address,
			item_id: nft.token_id,
			user_id: req.user._id,
			event_type: "sale_accepted",
			data: sale,
		});
		await event.save();
		// Event End

		res.send(sale);
	} catch (error) {
		res.status(500).send({ message: error.message });
	}
};

module.exports = { createSale, updateSale, cancelSale, buySale };
