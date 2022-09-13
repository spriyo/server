const { Auction } = require("../../../models/auction");
const { Bid } = require("../../../models/bid");
const { Event } = require("../../../models/event");
const { NFT } = require("../../../models/nft");

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

		const nft = await NFT.findOne({ _id: auction.asset_id });
		if (!nft) return res.status(404).send({ message: "Invalid nft id!" });
		if (nft.owner.toLowerCase() !== req.user.address.toLowerCase())
			return res
				.status(401)
				.send({ message: "only owner can create auction!" });

		var expireAt = new Date();
		expireAt.setDate(expireAt.getDate() + 1);
		auction.expireAt = expireAt;
		auction.seller = nft.owner;
		auction.reserve_price = req.body.reserve_price;
		auction.contract_address = nft.contract_address;
		auction.item_id = nft.token_id;
		await auction.save();

		// {}Event Start
		const event = new Event({
			asset_id: auction.asset_id,
			contract_address: auction.contract_address,
			item_id: auction.item_id,
			user_id: req.user._id,
			event_type: "auction_create",
			data: auction,
		});
		await event.save();
		// Event End

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
		await bid.save();
		await auction.save();

		// {}Event Start
		const event = new Event({
			asset_id: auction.asset_id,
			contract_address: auction.contract_address,
			item_id: auction.item_id,
			user_id: bid.user_id,
			event_type: "bid",
			data: auction,
		});
		await event.save();
		// Event End

		res.send(bid);
	} catch (error) {
		res.status(500).send({ message: error.message });
	}
};

const getBids = async (req, res) => {
	try {
		const bids = await Bid.aggregate([
			{
				$match: {
					$expr: { $eq: ["$user_id", req.user._id] },
				},
			},
			{
				$lookup: {
					from: "auctions",
					as: "auction",
					let: { auction_id: "$auction_id" },
					pipeline: [
						{
							$match: {
								$expr: { $eq: ["$_id", "$$auction_id"] },
							},
						},
						{
							$lookup: {
								from: "nfts",
								as: "asset",
								let: { asset_id: "$asset_id" },
								pipeline: [
									{
										$match: {
											$expr: { $eq: ["$_id", "$$asset_id"] },
										},
									},
								],
							},
						},
						{
							$unwind: { path: "$asset" },
						},
					],
				},
			},
			{
				$unwind: { path: "$auction" },
			},
		]);

		res.send(bids);
	} catch (error) {
		res.status(500).send({ message: error.message });
	}
};

const updateAuction = async (req, res) => {
	try {
		const auction = await Auction.findOne({
			_id: req.params.id,
			seller: req.user.address,
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

		auction.reserve_price = req.body.reserve_price;
		await auction.save();

		// {}Event Start
		const event = new Event({
			asset_id: auction.asset_id,
			contract_address: auction.contract_address,
			item_id: auction.item_id,
			user_id: req.user._id,
			event_type: "auction_update_price",
			data: auction,
		});
		await event.save();
		// Event End

		res.send(auction);
	} catch (error) {
		res.status(500).send({ message: error.message });
	}
};

const cancelAuction = async (req, res) => {
	try {
		const auction = await Auction.findOne({
			_id: req.params.id,
			seller: req.user.address,
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
		auction.status = "canceled";
		await auction.save();

		// {}Event Start
		const event = new Event({
			asset_id: auction.asset_id,
			contract_address: auction.contract_address,
			item_id: auction.item_id,
			user_id: req.user._id,
			event_type: "auction_canceled",
			data: auction,
		});
		await event.save();
		// Event End

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

		if (auction.bids.length === 0)
			return res.send({
				message:
					"Can't settle auction with 0 bids, try cancelling the auction.",
			});

		if (
			auction.seller !== req.user.address ||
			!auction.bids[0].user_id.equals(req.user._id)
		) {
			return res.status(401).send({
				message: "Only auction owner or highest bidder can settle the auction!",
			});
		}
		auction.status = "closed";
		await auction.save();

		// {}Event Start
		const event = new Event({
			asset_id: auction.asset_id,
			contract_address: auction.contract_address,
			item_id: auction.item_id,
			user_id: req.user._id,
			event_type: "auction_settled",
			data: auction,
		});
		await event.save();
		// Event End

		res.send(auction);
	} catch (error) {
		res.status(500).send({ message: error.message });
	}
};

module.exports = {
	createAuction,
	createBid,
	getBids,
	updateAuction,
	cancelAuction,
	settleAuction,
};
