const mongoose = require("mongoose")
const ObjectId = mongoose.Types.ObjectId;
const { Offer } = require("../../../models/offer");

const getOffers = async function (req, res) {
    try {
        const offers = await Offer.aggregate([
            {
                $match: {
                    $expr: {
                        $eq: ["$nft_id", ObjectId(req.params.nft_id)],
                    }
                }
            },
            { $sort: { createdAt: -1 } },
        ])
        res.send(offers)
    } catch (error) {
        res.status(500).send({ message: error.message })
    }
}

module.exports = { getOffers };
