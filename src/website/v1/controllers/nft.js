const { NFT } = require("../../../models/nft");
const { User } = require("../../../models/user");
const { Event } = require("../../../models/event");
const { Owner } = require("../../../models/owner");

const createAsset = async (req, res) => {
	try {
		// Check if medias were sent through request
		if (!req.file) {
			throw new Error("Invalid response received, no files received!");
		}

		const nft = new NFT(req.body);
		nft.image = req.file.location;
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
					from: "contracts",
					localField: "contract_address",
					foreignField: "address",
					as: "contract",
				},
			},
			{
				$lookup: {
					from: "collections",
					localField: "contract_address",
					foreignField: "contract_address",
					as: "collection",
				},
			},
			{
				$lookup: {
					from: "events",
					as: "events",
					let: { id: "$_id" },
					pipeline: [
						{
							$match: {
								$expr: { $eq: ["$nft_id", "$$id"] },
							},
						},
						{ $sort: { createdAt: -1 } },
						{ $limit: 10 },
					],
				},
			},
			{
				$lookup: {
					from: "owners",
					as: "owners",
					let: { id: "$_id" },
					pipeline: [
						{
							$match: {
								$expr: { $eq: ["$nft_id", "$$id"] },
							},
						},
						{
							$lookup: {
								from: "users",
								localField: "address",
								foreignField: "address",
								as: "user",
							},
						},
						{
							$unwind: { path: "$user", preserveNullAndEmptyArrays: true },
						},
						{
							$project: {
								"user.tokens": 0,
								"user.email": 0,
							},
						},
						{ $limit: 10 },
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
			{
				$unwind: { path: "$contract", preserveNullAndEmptyArrays: true },
			},
			{
				$unwind: { path: "$collection", preserveNullAndEmptyArrays: true },
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

const readNFTs = async (req, res) => {
	try {
		let query = req.query.query || "";
		let owner = req.query.owner;
		let chain_id = req.query.chain_id;
		let queryOptions = {
			name: { $regex: query, $options: "i" },
		};
		if (chain_id) {
			queryOptions.chain_id = chain_id;
		}
		let contract = req.query.contract;
		if (contract) {
			contract = req.query.contract.split(",").map((e) => new RegExp(e, "i"));
			queryOptions.contract_address = { $in: contract };
		}

		const assets = await NFT.aggregate([
			{
				$match: {
					...queryOptions,
					$expr: owner
						? { $eq: [{ $toLower: "$owner" }, { $toLower: owner }] }
						: {},
				},
			},
			{ $sort: { createdAt: req.query.createdAt === "asc" ? 1 : -1, _id: 1 } },
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
						{ $limit: 2 },
						{
							$unwind: { path: "$user_id" },
						},
					],
				},
			},
			{
				$lookup: {
					from: "owners",
					as: "owners",
					let: { id: "$_id" },
					pipeline: [
						{
							$match: {
								$expr: { $eq: ["$nft_id", "$$id"] },
							},
						},
						{
							$lookup: {
								from: "users",
								localField: "address",
								foreignField: "address",
								as: "user",
							},
						},
						{
							$unwind: { path: "$user", preserveNullAndEmptyArrays: true },
						},
						{
							$project: {
								"user.tokens": 0,
								"user.email": 0,
							},
						},
						{ $limit: 10 },
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
			{ $skip: parseInt(!req.query.skip ? 0 : req.query.skip) },
			{ $limit: parseInt(!req.query.limit ? 10 : req.query.limit) },
		]);

		res.send(assets);
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
			const user = new User({
				displayName: "Unnamed",
				username: req.body.address,
				address: req.body.address,
			});
			await user.save();
		}
		const currentOwner = await Owner.findOne({
			address: req.user.address,
			nft_id: nft._id,
		});
		let ownerExist = await Owner.findOne({
			address: assetData.address,
			nft_id: nft._id,
		});
		if (!ownerExist) {
			ownerExist = new Owner({
				token_id: assetData.token_id,
				address: assetData.address,
				chain_id: assetData.chain_id,
				contract_address: assetData.contract_address,
				nft_id: nft._id,
				supply: 0,
			});
		}
		ownerExist.supply = ownerExist.supply + assetData.supply;
		currentOwner.supply = currentOwner.supply - assetData.supply;
		await currentOwner.save();
		await ownerExist.save();
		if (currentOwner.supply === 0) {
			await currentOwner.delete();
		}

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

const getTotalNFTCount = async (req, res) => {
	try {
		const count = await NFT.count();
		res.send({ count });
	} catch (error) {
		res.status(500).send({ message: error.message });
	}
};

module.exports = {
	createAsset,
	readAsset,
	transferAsset,
	getTotalNFTCount,
};
