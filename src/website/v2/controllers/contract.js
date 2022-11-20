const { Contract } = require("../../../models/contract");

const getContract = async (req, res) => {
	try {
		const contracts = await Contract.aggregate([
			{
				$match: {
					$expr: {
						$eq: ["$address", req.params.address],
					},
				},
			},
			{
				$lookup: {
					from: "collections",
					localField: "address",
					foreignField: "contract_address",
					as: "collection",
				},
			},
			{
				$lookup: {
					from: "users",
					localField: "creator",
					foreignField: "address",
					as: "owners",
				},
			},
			{
				$project: {
					"owners.tokens": 0,
					"owners.email": 0,
				},
			},
			{
				$lookup: {
					from: "nfts",
					as: "nfts_count",
					let: {
						address: "$address",
					},
					pipeline: [
						{
							$match: {
								$expr: { $eq: ["$contract_address", "$$address"] },
							},
						},
						{
							$count: "count",
						},
					],
				},
			},
			{
				$lookup: {
					from: "owners",
					as: "owners_count",
					let: {
						address: "$address",
					},
					pipeline: [
						{
							$match: {
								$expr: { $eq: ["$contract_address", "$$address"] },
							},
						},
						{
							$group: {
								_id: "$address",
							},
						},
						{
							$count: "count",
						},
					],
				},
			},
			{
				$unwind: { path: "$collection", preserveNullAndEmptyArrays: true },
			},
			{
				$unwind: { path: "$nfts_count", preserveNullAndEmptyArrays: true },
			},
			{
				$unwind: { path: "$owners_count", preserveNullAndEmptyArrays: true },
			},
		]);
		if (contracts.length === 0) {
			res
				.status(404)
				.send({ message: "No contract found with the given data." });
		} else {
			res.send(contracts[0]);
		}
	} catch (error) {
		res.status(500).send({ message: error.message });
	}
};

const getUserContracts = async (req, res) => {
	try {
		const contracts = await Contract.aggregate([
			{
				$match: {
					$expr: {
						$eq: ["$creator", req.user.address],
					},
				},
			},
			{
				$lookup: {
					from: "collections",
					localField: "address",
					foreignField: "contract_address",
					as: "collection",
				},
			},
			{ $sort: { createdAt: -1 } },
			{
				$unwind: { path: "$collection", preserveNullAndEmptyArrays: true },
			},
		]);

		res.send(contracts);
	} catch (error) {
		res.status(500).send({ message: error.message });
	}
};

module.exports = { getContract, getUserContracts };
