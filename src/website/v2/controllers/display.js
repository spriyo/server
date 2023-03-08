const { Auction } = require("../../../models/auction");
const { Contract } = require("../../../models/contract");
const { NFT } = require("../../../models/nft");
const { Sale } = require("../../../models/sale");
const { mongo } = require("mongoose");

const getStatistics = async function (req, res) {
	try {
		const nftCollectionLength = await Contract.aggregate([
			{
				$lookup: {
					from: "nfts",
					let: { address: "$address" },
					pipeline: [
						{
							$match: {
								$expr: { $eq: ["$contract_address", "$$address"] },
							},
						},
						{
							$limit: 1,
						},
					],
					as: "nfts",
				},
			},
			{
				$project: {
					_id: 1,
					address: 1,
					moreThanZero: { $gt: [{ $size: "$nfts" }, 0] },
				},
			},
			{ $match: { moreThanZero: true } },
			{
				$group: {
					_id: "$address",
					total_collections: { $count: {} },
				},
			},
			{
				$count: "total_collections",
			},
		]);
		const oneDayMints = await NFT.aggregate([
			{
				$match: {
					createdAt: {
						$gte: new Date(
							new Date().getFullYear() +
								"/" +
								(new Date().getMonth() + 1) +
								"/" +
								new Date().getDate()
						),
					},
				},
			},
			{
				$count: "one_day_mints",
			},
		]);

		// Total Volume
		const auctionVolume = await Auction.aggregate([
			{
				$match: {
					status: "settle",
				},
			},
			{
				$group: {
					_id: 0,
					totalAuctionVolume: { $sum: { $toDecimal: "$reserve_price" } },
				},
			},
		]);
		const saleVolume = await Sale.aggregate([
			{
				$match: {
					status: "accept",
				},
			},
			{
				$group: {
					_id: 0,
					totalSaleVolume: { $sum: { $toDecimal: "$amount" } },
				},
			},
		]);
		if (!saleVolume[0]) {
			saleVolume.push({});
			saleVolume[0].totalSaleVolume = 0;
		}
		if (!auctionVolume[0]) {
			auctionVolume.push({});
			auctionVolume[0].totalAuctionVolume = 0;
		}
		const totalVolume =
			parseInt(saleVolume[0].totalSaleVolume) +
			parseInt(auctionVolume[0].totalAuctionVolume);
		// one Day Total Volume
		const oneDayAuctionVolume = await Auction.aggregate([
			{
				$match: {
					status: "settle",
					updatedAt: {
						$gte: new Date(
							new Date().getFullYear() +
								"/" +
								(new Date().getMonth() + 1) +
								"/" +
								new Date().getDate()
						),
					},
				},
			},
			{
				$group: {
					_id: 0,
					totalAuctionVolume: { $sum: { $toDecimal: "$reserve_price" } },
				},
			},
		]);
		const oneDaySaleVolume = await Sale.aggregate([
			{
				$match: {
					status: "accept",
					updatedAt: {
						$gte: new Date(
							new Date().getFullYear() +
								"/" +
								(new Date().getMonth() + 1) +
								"/" +
								new Date().getDate()
						),
					},
				},
			},
			{
				$group: {
					_id: 0,
					totalSaleVolume: { $sum: { $toDecimal: "$amount" } },
				},
			},
		]);
		if (!oneDayAuctionVolume[0]) {
			oneDayAuctionVolume.push({});
			oneDayAuctionVolume[0].totalAuctionVolume = 0;
		}
		if (!oneDaySaleVolume[0]) {
			oneDaySaleVolume.push({});
			oneDaySaleVolume[0].totalSaleVolume = 0;
		}
		const oneDayTotalVolume =
			parseInt(oneDaySaleVolume[0].totalSaleVolume) +
			parseInt(oneDayAuctionVolume[0].totalAuctionVolume);
		res.send({
			total_collections: nftCollectionLength[0],
			one_day_mints: oneDayMints[0],
			total_volume: totalVolume,
			one_day_volume: oneDayTotalVolume,
		});
	} catch (error) {
		res.status(500).send({ message: error.message });
	}
};

module.exports = { getStatistics };
