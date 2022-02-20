const { Asset } = require("../../../models/asset");
const { AssetMedia } = require("../../../models/assetMedia");

createAsset = async (req, res) => {
	try {
		const asset = new Asset(req.body);
		asset.owner = req.user._id;
		asset.created_by = req.user._id;

		// Check if medias were sent through request
		let photoList = [];
		if (req.files.length > 0) {
			req.files.forEach((file) => {
				photoList.push({
					asset_id: asset._id,
					path: file.location,
					assetPath: file.key,
					originalName: file.originalname,
					mimetype: file.mimetype,
					size: file.size,
				});
			});
		}

		const medias = await AssetMedia.insertMany(photoList);
		medias.forEach((photo) => asset.medias.push(photo._id));
		await asset.save();
		res.status(201).send(asset);
	} catch (error) {
		res.status(500).send({ message: error.message });
	}
};

readAsset = async (req, res) => {
	try {
		const asset = await Asset.findById(req.params.id).populate("medias").lean();
		if (!asset) {
			return res
				.status(404)
				.send({ message: "Asset was not found with the given data" });
		}
		const id = asset._id;
		delete asset._id;
		asset.views++;
		await Asset.updateOne({ _id: id }, asset);
		res.send(asset);
	} catch (error) {
		res.status(500).send({ message: error.message });
	}
};

readAssetsUser = async (req, res) => {
	try {
		const assets = await Asset.find({ owner_id: req.params.id })
			.limit(parseInt(req.query.limit))
			.skip(parseInt(req.query.skip))
			.populate("medias")
			.exec();

		res.send(assets);
	} catch (error) {
		res.status(500).send({ message: error.message });
	}
};

// updateItem = async (req, res) => {
// 	let updates = Object.keys(req.body);
// 	const availableUpdates = [
// 		"title",
// 		"description",
// 		"unit",
// 		"duration",
// 		"status",
// 		"address_id",
// 		"location",
// 		"refundable_deposit",
// 		"price",
// 		"category",
// 	];
// 	const isValid = updates.every((update) => availableUpdates.includes(update));
// 	if (!isValid) {
// 		return res.status(400).send({ message: "Invalid response received" });
// 	}

// 	try {
// 		const item = await Item.findById(req.params.id);
// 		if (!item) {
// 			return res
// 				.status(404)
// 				.send({ message: "Item was not found with the given data" });
// 		}
// 		// Cross User Update
// 		if (!req.user._id.equals(item.user_id)) {
// 			return res
// 				.status(401)
// 				.send({ message: "Unauthorized cross user update" });
// 		}
// 		updates.forEach((update) => (item[update] = req.body[update]));
// 		await item.save();
// 		res.send(item);
// 	} catch (e) {
// 		res.status(500).send({ message: e.message });
// 	}
// };

// deleteItem = async (req, res) => {
// 	try {
// 		const item = await Item.findById(req.params.id);
// 		if (!item) {
// 			return res
// 				.status(404)
// 				.send({ message: "Item was not found with the given data" });
// 		}
// 		if (!item.user_id.equals(req.user._id)) {
// 			return res.status(401).send({ message: "_id mismatch with user" });
// 		}
// 		await item.remove();
// 		res.send(item);
// 	} catch (error) {
// 		res.status(500).send({ message: error.message });
// 	}
// };

module.exports = {
	createAsset,
	readAsset,
	readAssetsUser,
};
