const { Asset } = require("../../../models/asset");
const { AssetMedia } = require("../../../models/assetMedia");
const { Event } = require("../../../models/event");

const createAsset = async (req, res) => {
	try {
		const asset = new Asset(req.body);
		asset.owner = req.user._id;
		asset.created_by = req.user._id;

		// Check if medias were sent through request
		if (!req.files) {
			throw new Error("Invalid response received, no files received!");
		}
		let photoList = [];
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

		const medias = await AssetMedia.insertMany(photoList);
		medias.forEach((photo) => asset.medias.push(photo._id));
		await asset.save();

		// Event Start
		const event = new Event({
			asset_id: asset._id,
			contract_address: asset.contract_address,
			item_id: asset.item_id,
			user_id: asset.owner,
			event_type: "mint",
			data: asset,
		});
		await event.save();
		// Event End

		res.status(201).send(asset);
	} catch (error) {
		res.status(500).send({ message: error.message });
	}
};

const readAsset = async (req, res) => {
	try {
		const asset = await Asset.findById(req.params.id)
			.populate("medias owner", "-tokens")
			.populate({
				path: "events",
				populate: {
					path: "user_id",
					select: "-tokens",
				},
				options: {
					sort: {
						createdAt: -1,
					},
				},
			})
			.lean();
		if (!asset) {
			return res
				.status(404)
				.send({ message: "Asset was not found with the given data" });
		}
		const id = asset._id;
		// delete asset._id;
		asset.views++;
		await Asset.updateOne({ _id: id }, asset);
		res.send(asset);
	} catch (error) {
		res.status(500).send({ message: error.message });
	}
};

const readAssets = async (req, res) => {
	try {
		const assets = await Asset.find()
			.limit(parseInt(req.query.limit ?? 0))
			.skip(parseInt(req.query.skip ?? 0))
			.populate({
				path: "events",
				options: { limit: 3, sort: { createdAt: -1 } },
			})
			.populate("medias owner created_by")
			.sort({ createdAt: -1 });

		res.send(assets);
	} catch (error) {
		res.status(500).send({ message: error.message });
	}
};

const readAssetsUser = async (req, res) => {
	try {
		const assets = await Asset.find({ owner: req.params.id })
			.limit(parseInt(req.query.limit || 0))
			.skip(parseInt(req.query.skip || 0))
			.populate({
				path: "events",
				options: { limit: 3, sort: { createdAt: -1 } },
			})
			.populate("medias owner created_by")
			.exec();

		res.send(assets);
	} catch (error) {
		res.status(500).send({ message: error.message });
	}
};

module.exports = {
	createAsset,
	readAsset,
	readAssets,
	readAssetsUser,
};
