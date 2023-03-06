const { NFT } = require("../../../models/nft");
const { Owner } = require("../../../models/owner");

const router = require("express").Router();

router.get("/users/nfts/:address", async (req, res) => {
	try {
		const owner = req.params.address;

		let ownerQuery = {};
		if (owner) {
			ownerQuery["address"] = new RegExp(owner, "i");
		}

		const nfts = await Owner.aggregate([
			{
				$match: {
					...ownerQuery,
				},
			},
			{ $sort: { createdAt: req.query.createdAt === "asc" ? 1 : -1, _id: 1 } },
			{
				$lookup: {
					from: "nfts",
					as: "nft",
					let: {
						contract_address: "$contract_address",
						token_id: "$token_id",
						chain_id: "$chain_id",
					},
					pipeline: [
						{
							$match: {
								$and: [
									{
										$expr: { $eq: ["$contract_address", "$$contract_address"] },
									},
									{ $expr: { $eq: ["$token_id", "$$token_id"] } },
									{ $expr: { $eq: ["$chain_id", "$$chain_id"] } },
								],
							},
						},
					],
				},
			},
			{
				$unwind: { path: "$nft", preserveNullAndEmptyArrays: true },
			},
			{ $skip: parseInt(!req.query.skip ? 0 : req.query.skip) },
			{ $limit: parseInt(!req.query.limit ? 10 : req.query.limit) },
		]);

		res.send(nfts);
	} catch (error) {
		console.log(error);
	}
});

module.exports = router;
