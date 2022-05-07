const res = require("express/lib/response");
const { Asset } = require("../../../models/asset");
const { Auction } = require("../../../models/auction");
const { Bid } = require("../../../models/bid");

const createAuction = async (req, res) => {
	try {
		// No auction with same asset id should take place
		const isAuctionExist = await Auction.findOne({
			asset_id: req.body.asset_id,
			completed: false,
		});
		if (isAuctionExist)
			return res
				.status(500)
				.send({ message: "Auction is already going on for this asset!" });

		const auction = new Auction(req.body);

		const asset = await Asset.findOne({ _id: auction.asset_id, type: "open" });
		if (!asset) return res.status(404).send({ message: "Invalid asset id!" });

		var expireAt = new Date();
		expireAt.setDate(expireAt.getDate() + 1);
		auction.expireAt = expireAt;
		auction.seller = asset.owner;
		await auction.save();

		res.status(201).send(auction);
	} catch (error) {
		res.status(500).send({ message: error.message });
	}
};

const createBid = async (req, res) => {
	try {
		const auction = await Auction.findOne({
			_id: req.body.auction_id,
			completed: false,
		});
		if (!auction) res.status(404).send({ message: "Invalid auction id" });

		const bid = new Bid(req.body);
		bid.user_id = req.user._id;
		auction.bids = [bid, ...auction.bids];
		const previous_bidder = auction.current_bidder;
		auction.current_bidder = req.user._id;
		auction.previous_bidder = previous_bidder;
		await auction.save();
		await bid.save();
		res.send(bid);
	} catch (error) {
		res.status(500).send({ message: error.message });
	}
};

const updateAuction = async (req, res) => {
	try {
		const auction = await Auction.findOne({
			_id: req.params.id,
			seller: req.user._id,
			completed: false,
		}).sort({ createdAt: -1 });

		if (!auction)
			return res.status(404).send({
				message: "Auction doesn't exist or it migt have been settled/closed.",
			});

		if (auction.bids.length > 0)
			return res.send({
				message: "Can't update now, Auction has already started!",
			});

		auction.reserve_price = parseInt(req.body.reserve_price);
		await auction.save();
		res.send(auction);
	} catch (error) {
		res.status(500).send({ message: error.message });
	}
};

const cancelAuction = async (req, res) => {
	try {
		const auction = await Auction.findOne({
			_id: req.params.id,
			seller: req.user._id,
			completed: false,
		}).sort({ createdAt: -1 });

		if (!auction)
			return res.status(404).send({
				message: "Auction doesn't exist or it migt have been settled/closed.",
			});

		if (auction.bids.length > 0)
			return res.send({
				message: "Can't cancel now, Auction has already started!",
			});
		auction.completed = true;
		auction.status = "closed";
		await auction.save();
		res.send(auction);
	} catch (error) {
		res.status(500).send({ message: error.message });
	}
};

const settleAuction = async (req, res) => {
	try {
		const auction = await Auction.findOne({
			_id: req.params.id,
			completed: false,
		})
			.sort({ createdAt: -1 })
			.populate({
				path: "bids",
				options: {
					limit: 1,
					populate: {
						path: "user_id",
					},
				},
			});
		if (!auction)
			return res.status(404).send({
				message: "Auction doesn't exist or it migt have been settled/closed.",
			});

		if (
			!auction.seller.equals(req.user._id) ||
			!auction.bids[0].user_id.equals(req.user._id)
		) {
			return res.status(401).send({
				message: "Only auction owner or highest bidder can settle the auction!",
			});
		}
		auction.status = "completed";
		res.send(auction);
	} catch (error) {
		res.status(500).send({ message: error.message });
	}
};

module.exports = {
	createAuction,
	createBid,
	updateAuction,
	cancelAuction,
	settleAuction,
};
