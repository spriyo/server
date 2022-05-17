const { Asset } = require("../../../models/asset");
const { Sale } = require("../../../models/sale");

const getActiveSales = async (req, res) => {
	try {
		const sales = await Sale.find({
			status: "onsale",
			sold: false,
		})
			.limit(parseInt(req.query.limit ?? 0))
			.skip(parseInt(req.query.skip ?? 0))
			.populate("seller buyer")
			.populate({
				path: "asset_id",
				populate: {
					path: "medias owner created_by events",
					options: {
						limit: 1,
						sort: {
							createdAt: -1,
						},
					},
				},
			});

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

module.exports = {
	getActiveSales,
	getTopCreators,
};
