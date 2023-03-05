const { Asset } = require("../../../models/asset");
const { Auction } = require("../../../models/auction");
const { NFT } = require("../../../models/nft");
const { Offer } = require("../../../models/offer");
const { Sale } = require("../../../models/sale");

const getActiveSales = async (req, res) => {
	let assetOptions = {};
	let chainId = req.query.chainId;
	if (chainId) {
		assetOptions.chain_id = parseInt(chainId);
	}
	try {
		const sales = await Sale.aggregate([
			{
				$match: {
					status: "onsale",
					sold: false,
				},
			},
			{ $sort: { createdAt: -1 } },
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
										$unwind: {
											path: "$user",
											preserveNullAndEmptyArrays: true,
										},
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
		let contract = req.query.contract;
		let type = req.query.type;
		let queryOptions = {
			$or: [
				{ name: { $regex: query, $options: "i" } },
				{ token_id: { $regex: query, $options: "i" } },
				{ contract_address: { $regex: query, $options: "i" } },
				{ metadata_url: { $regex: query, $options: "i" } },
				{ description: { $regex: query, $options: "i" } },
			],
		};
		if (chain_id) {
			queryOptions.chain_id = parseInt(chain_id);
		}
		if (type) {
			queryOptions.type = type;
		}
		if (contract) {
			contract = req.query.contract.split(",").map((e) => new RegExp(e, "i"));
			queryOptions.contract_address = { $in: contract };
		}
		let ownerQuery = {};
		if (owner) {
			ownerQuery["owners.address"] = new RegExp(owner, "i");
		}

		const assets = await NFT.aggregate([
			{
				$match: {
					...queryOptions,
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
			// This match slows down the query
			{
				$match: {
					...ownerQuery,
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

const searchNftsByStatus = async (req, res) => {
	try {
		let query = req.query.query || "";
		let owner = req.query.owner;
		let chain_id = req.query.chain_id;
		let contract = req.query.contract;
		let type = req.query.type;
		let status = req.query.status;
		let queryOptions = {
			$or: [
				{ name: { $regex: query, $options: "i" } },
				{ token_id: { $regex: query, $options: "i" } },
				{ contract_address: { $regex: query, $options: "i" } },
				{ metadata_url: { $regex: query, $options: "i" } },
				{ description: { $regex: query, $options: "i" } },
			],
		};
		if (chain_id) {
			queryOptions.chain_id = parseInt(chain_id);
		}
		if (type) {
			queryOptions.type = type;
		}
		if (contract) {
			contract = req.query.contract.split(",").map((e) => new RegExp(e, "i"));
			queryOptions.contract_address = { $in: contract };
		}
		let ownerQuery = {};
		if (owner) {
			ownerQuery["owners.address"] = new RegExp(owner, "i");
		}

		let nftQuery = [
			{
				$match: {
					...queryOptions,
					$expr: { $eq: ["$_id", "$$nft_id"] },
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
			// This match slows down the query
			{
				$match: {
					...ownerQuery,
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
			{ $limit: 1 },
		];

		let assets = [];
		if (status) {
			if (status === "buy") {
				assets = await Sale.aggregate([
					{
						$match: {
							status: "create",
						},
					},
					{
						$lookup: {
							from: "nfts",
							as: "nft",
							let: { nft_id: "$nft_id" },
							pipeline: nftQuery,
						},
					},
					{ $unwind: { path: "$nft" } },
					{ $skip: parseInt(!req.query.skip ? 0 : req.query.skip) },
					{ $limit: parseInt(!req.query.limit ? 10 : req.query.limit) },
				]);
			} else if (status === "auction") {
				assets = await Auction.aggregate([
					{
						$match: {
							status: "create",
						},
					},
					{
						$lookup: {
							from: "nfts",
							as: "nft",
							let: { nft_id: "$nft_id" },
							pipeline: nftQuery,
						},
					},
					{ $unwind: { path: "$nft" } },
					{ $skip: parseInt(!req.query.skip ? 0 : req.query.skip) },
					{ $limit: parseInt(!req.query.limit ? 10 : req.query.limit) },
				]);
			} else if (status === "offer") {
				assets = await Offer.aggregate([
					{
						$match: {
							status: "create",
						},
					},
					{
						$lookup: {
							from: "nfts",
							as: "nft",
							let: { nft_id: "$nft_id" },
							pipeline: nftQuery,
						},
					},
					{ $unwind: { path: "$nft" } },
					{ $skip: parseInt(!req.query.skip ? 0 : req.query.skip) },
					{ $limit: parseInt(!req.query.limit ? 10 : req.query.limit) },
				]);
			}
		}
		assets = assets.map((a) => {
			let n = a.nft;
			delete a.nft;
			n[status] = a;
			return n;
		});
		res.send(assets);
	} catch (error) {
		res.status(500).send({ message: error.message });
	}
};

module.exports = {
	getActiveSales,
	getTopCreators,
	searchNfts,
	searchNftsByStatus,
};
