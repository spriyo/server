const { Asset } = require("../../../models/asset");
const { User } = require("../../../models/user");
const { AssetMedia } = require("../../../models/assetMedia");
const { Event } = require("../../../models/event");
const { default: axios } = require("axios");

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

const importAsset = async (req, res) => {
	try {
		const asset = new Asset(req.body);
		const assetExist = await Asset.findOne({
			chainId: asset.chainId,
			contract_address: new RegExp("^" + asset.contract_address + "$", "i"),
			item_id: asset.item_id,
		});
		if (assetExist)
			return res.status(409).send({ message: "Asset already exist!" });

		const response = await axios.get(asset.metadata_url);
		if (response.status !== 200) {
			res.status(400).send({ message: "unable to fetch metadata." });
		}
		const metadata = response.data;

		asset.imported = true;
		asset.description = metadata.description;
		asset.name = metadata.name;
		asset.image = `https://ipfs.io/ipfs/${metadata.hash}`;
		asset.metadata = metadata;
		asset.owner = req.user._id;

		await asset.save();

		// Event Start
		const event = new Event({
			asset_id: asset._id,
			contract_address: asset.contract_address,
			item_id: asset.item_id,
			user_id: asset.owner,
			event_type: "imported",
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
		const asset = await Asset.findOne({
			contract_address: req.params.contract_address,
			item_id: req.params.token_id,
		})
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

const transferAsset = async (req, res) => {
	try {
		const assetData = req.body;
		const asset = await Asset.findOne({
			chainId: assetData.chainId,
			contract_address: new RegExp("^" + assetData.contract_address + "$", "i"),
			item_id: assetData.item_id,
		});
		if (!asset)
			return res
				.status(409)
				.send({ message: "Asset not found with given details!" });

		const userExist = await User.findOne({
			address: req.body.userId,
		});
		if (userExist) {
			asset.owner = userExist;
		} else {
			const owner = new User({
				displayName: "Unnamed",
				username: req.body.userId,
				address: req.body.userId,
			});
			await owner.save();
			asset.owner = owner._id;
		}

		await asset.save();

		// Event Start
		const event = new Event({
			asset_id: asset._id,
			contract_address: asset.contract_address,
			item_id: asset.item_id,
			user_id: req.user._id,
			event_type: "transfer",
			data: asset,
		});
		await event.save();
		// Event End

		res.status(201).send(asset);
	} catch (error) {
		res.status(500).send({ message: error.message });
	}
};

module.exports = {
	createAsset,
	importAsset,
	readAsset,
	transferAsset,
};
