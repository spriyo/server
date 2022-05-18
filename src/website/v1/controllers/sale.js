const { Sale } = require("../../../models/sale");
const { Asset } = require("../../../models/asset");
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

		const asset = await Asset.findById(req.body.asset_id);
		if (!asset) return res.send({ message: "No asset found with given id!" });

		if (!sale.seller.equals(asset.owner))
			return res
				.status(401)
				.send({ message: "Only the asset owner can list it for sale!" });

		await sale.save();

		// Event Start
		const event = new Event({
			asset_id: asset._id,
			contract_address: asset.contract_address,
			item_id: asset.item_id,
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

		const asset = await Asset.findById(sale.asset_id);
		sale.status = "canceled";
		sale.sold = true;
		await sale.save();

		// Event Start
		const event = new Event({
			asset_id: asset._id,
			contract_address: asset.contract_address,
			item_id: asset.item_id,
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

		const asset = await Asset.findById(sale.asset_id);
		sale.amount = req.body.amount;
		await sale.save();

		// Event Start
		const event = new Event({
			asset_id: asset._id,
			contract_address: asset.contract_address,
			item_id: asset.item_id,
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

		const asset = await Asset.findById(sale.asset_id);
		asset.owner = req.user._id;

		sale.buyer = req.user._id;
		sale.status = "sold";
		sale.sold = true;
		await sale.save();
		await asset.save();

		// Event Start
		const event = new Event({
			asset_id: asset._id,
			contract_address: asset.contract_address,
			item_id: asset.item_id,
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
