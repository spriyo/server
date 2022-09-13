const { NFT } = require("../../../models/nft");
const { User } = require("../../../models/user");
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
		const owner = new Owner(req.body);
		owner.address = nft.owner;
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

const readAsset = async (req, res) => {
	try {
		const nft = await NFT.aggregate([
			{
				$match: {
					$and: [
						{
							$expr: {
								$eq: ["$contract_address", req.params.contract_address],
							},
						},
						{ $expr: { $eq: ["$token_id", req.params.token_id] } },
					],
				},
			},
			{
				$lookup: {
					from: "events",
					as: "events",
					let: { asset_id: "$_id" },
					pipeline: [
						{
							$match: {
								$expr: { $eq: ["$asset_id", "$$asset_id"] },
							},
						},
						{
							$lookup: {
								from: "users",
								as: "user_id",
								let: { user_id: "$user_id" },
								pipeline: [
									{
										$match: {
											$expr: { $eq: ["$_id", "$$user_id"] },
										},
									},
									{ $project: { tokens: 0 } },
								],
							},
						},
						{ $sort: { createdAt: -1 } },
						{ $limit: 10 },
						{
							$unwind: { path: "$user_id" },
						},
					],
				},
			},
			{
				$lookup: {
					from: "users",
					as: "owner",
					let: { owner: "$owner" },
					pipeline: [
						{
							$match: {
								$expr: {
									$eq: [{ $toLower: "$address" }, { $toLower: "$$owner" }],
								},
							},
						},
						{ $project: { tokens: 0 } },
					],
				},
			},
			{
				$lookup: {
					from: "likes",
					as: "likes",
					let: { asset_id: "$_id" },
					pipeline: [
						{
							$match: {
								$expr: { $eq: ["$asset_id", "$$asset_id"] },
								user_id: req.user ? req.user._id : "",
							},
						},
					],
				},
			},
			{
				$addFields: {
					liked: {
						$toBool: {
							$size: "$likes",
						},
					},
				},
			},
			{
				$project: {
					likes: 0,
				},
			},
			{
				$unwind: { path: "$owner", preserveNullAndEmptyArrays: true },
			},
		]);
		if (nft.length === 0) {
			return res
				.status(404)
				.send({ message: "NFT was not found with the given data" });
		}
		res.send(nft[0]);
	} catch (error) {
		res.status(500).send({ message: error.message });
	}
};

const transferAsset = async (req, res) => {
	try {
		const assetData = req.body;
		const nft = await NFT.findOne({
			chain_id: assetData.chain_id,
			contract_address: new RegExp("^" + assetData.contract_address + "$", "i"),
			token_id: assetData.token_id,
		});
		if (!nft)
			return res
				.status(409)
				.send({ message: "Nft not found with given details!" });

		const userExist = await User.findOne({
			address: req.body.address,
		});
		if (!userExist) {
			const owner = new User({
				displayName: "Unnamed",
				username: req.body.address,
				address: req.body.address,
			});
			await owner.save();
		}
		const currentOwner = await Owner.findOne({
			address: req.user.address,
			contract_address: new RegExp("^" + assetData.contract_address + "$", "i"),
			token_id: assetData.token_id,
			chain_id: assetData.chain_id,
		});
		const ownerExist = await Owner.findOne({
			address: req.body.address,
			contract_address: new RegExp("^" + assetData.contract_address + "$", "i"),
			token_id: assetData.token_id,
			chain_id: assetData.chain_id,
		});
		if (ownerExist) {
			ownerExist.value = (
				parseInt(ownerExist.value) + parseInt(assetData.value)
			).toString();
			await ownerExist.save();
		} else {
			const newOwner = new Owner({ ...req.body });
			await newOwner.save();
		}
		currentOwner.value = (
			parseInt(currentOwner.value) - parseInt(assetData.value)
		).toString();
		await currentOwner.save();

		await nft.save();
		nft.value = assetData.value;
		// Event Start
		const event = new Event({
			asset_id: nft._id,
			contract_address: nft.contract_address,
			item_id: nft.token_id,
			user_id: req.user._id,
			event_type: "transfer",
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
	readAsset,
	transferAsset,
};
