const { Asset } = require("../../../models/asset");
const { NFT } = require("../../../models/nft");
const { Sale } = require("../../../models/sale");

const getActiveSales = async (req, res) => {
	let assetOptions = {};
	let chainId = req.query.chainId;
	if (chainId) {
		assetOptions.chain_id = chainId;
	}
	try {
		const sales = await Sale.aggregate([
			{
				$match: {
					status: "onsale",
					sold: false,
				},
			},
			{
				$lookup: {
					from: "nfts",
					as: "asset_id",
					let: { asset_id: "$asset_id" },
					pipeline: [
						{
							$match: {
								$expr: { $eq: ["$_id", "$$asset_id"] },
								...assetOptions,
							},
						},
						{
							$lookup: {
								from: "users",
								as: "owner",
								let: { owner_id: "$owner" },
								pipeline: [
									{
										$match: {
											$expr: {
												$eq: [
													{ $toLower: "$address" },
													{ $toLower: "$$owner_id" },
												],
											},
										},
									},
									{ $project: { tokens: 0 } },
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
									{ $limit: 2 },
									{ $sort: { createdAt: -1 } },
									{
										$unwind: { path: "$user_id" },
									},
								],
							},
						},
					],
				},
			},
			{ $sort: { createdAt: -1 } },
			{
				$unwind: { path: "$asset_id" },
			},
			{
				$unwind: { path: "$asset_id.owner" },
			},
			{ $limit: parseInt(!req.query.limit ? 10 : req.query.limit) },
			{ $skip: parseInt(req.query.skip ?? 0) },
		]);

		res.send(sales);
	} catch (error) {
		res.status(500).send({ message: error.message });
	}
};

const getTopCreators = async (req, res) => {
	try {
		const creators = await Asset.aggregate([
			{
				$group: {
					_id: "$created_by",
					count: { $sum: 1 },
				},
			},
			{
				$lookup: {
					from: "users",
					localField: "_id",
					foreignField: "_id",
					as: "user",
				},
			},
			{ $unwind: "$user" },
			{ $project: { "user.tokens": 0 } },
			{ $limit: 10 },
			{
				$sort: {
					count: -1,
				},
			},
		]);

		return res.send(creators);
	} catch (error) {
		res.status(500).send({ message: error.message });
	}
};

const searchNfts = async (req, res) => {
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
		const assets = await NFT.aggregate([
			{
				$match: {
					...queryOptions,
					$expr: owner
						? { $eq: [{ $toLower: "$owner" }, { $toLower: owner }] }
						: {},
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
						{ $limit: 2 },
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
			{ $sort: { createdAt: req.query.createdAt === "asc" ? 1 : -1, _id: 1 } },
			{ $skip: parseInt(!req.query.skip ? 0 : req.query.skip) },
			{ $limit: parseInt(!req.query.limit ? 10 : req.query.limit) },
		]);

		res.send(assets);
	} catch (error) {
		res.status(500).send({ message: error.message });
	}
};

module.exports = {
	getActiveSales,
	getTopCreators,
	searchNfts,
};
