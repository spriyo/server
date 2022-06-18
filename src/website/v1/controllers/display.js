const { Asset } = require("../../../models/asset");
const { Sale } = require("../../../models/sale");

const getActiveSales = async (req, res) => {
	let assetOptions = {};
	let chainId = req.query.chainId;
	if (chainId) {
		assetOptions.chainId = chainId;
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
					from: "assets",
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
								from: "assetmedias",
								as: "medias",
								let: { asset_id: "$_id" },
								pipeline: [
									{
										$match: {
											$expr: { $eq: ["$asset_id", "$$asset_id"] },
										},
									},
								],
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
											$expr: { $eq: ["$_id", "$$owner_id"] },
										},
									},
									{ $project: { tokens: 0 } },
								],
							},
						},
						{
							$lookup: {
								from: "users",
								as: "created_by",
								let: { created_by: "$created_by" },
								pipeline: [
									{
										$match: {
											$expr: { $eq: ["$_id", "$$created_by"] },
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
			{
				$unwind: { path: "$asset_id.created_by" },
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

const search = async (req, res) => {
	try {
		let query = req.query.query || "";
		let chainId = req.query.chainId;
		let queryOptions = {
			name: { $regex: query, $options: "i" },
		};
		if (chainId) {
			queryOptions.chainId = chainId;
		}
		const assets = await Asset.aggregate([
			{
				$match: queryOptions,
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
			{
				$lookup: {
					from: "assetmedias",
					as: "medias",
					let: { asset_id: "$_id" },
					pipeline: [
						{
							$match: {
								$expr: { $eq: ["$asset_id", "$$asset_id"] },
							},
						},
					],
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
								$expr: { $eq: ["$_id", "$$owner_id"] },
							},
						},
						{ $project: { tokens: 0 } },
					],
				},
			},
			{
				$lookup: {
					from: "users",
					as: "created_by",
					let: { created_by: "$created_by" },
					pipeline: [
						{
							$match: {
								$expr: { $eq: ["$_id", "$$created_by"] },
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
			{
				$unwind: { path: "$created_by", preserveNullAndEmptyArrays: true },
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
	search,
};
