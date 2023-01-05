const Comment = require("../../../models/comment");
const { NFT } = require("../../../models/nft");
const { Owner } = require("../../../models/owner");
const { User } = require("../../../models/user");
const { createNotificationInter } = require("./notification");

createComment = async (req, res) => {
	// Add ParentCommentId to comment(reply) to ParentComment
	try {
		// Check if Asset Exists
		const nft = await NFT.findById(req.body.nft_id);
		if (!nft) return res.status(404).send({ message: "Invalid nft _id." });

		const comment = new Comment(req.body);
		comment.userId = req.user._id;
		await comment.save();
		await comment.populate("userId");

		res.status(201).send(comment);
	} catch (error) {
		res.status(500).send({ message: error.message });
	}
};

readComments = async (req, res) => {
	try {
		const comments = await Comment.find({
			nft_id: req.params.nftid,
			parrentCommentId: { $eq: null },
		})
			.sort("-createdAt")
			.populate({
				path: "replies",
				options: {
					limit: 5,
					skip: 0,
					populate: {
						path: "userId",
						select: "-tokens -password -phone -email",
					},
				},
			})
			.populate("userId", "-tokens -password -phone -email")
			.limit(parseInt(req.query.limit || "5"))
			.skip(parseInt(req.query.skip || "0"));

		res.send(comments);
	} catch (error) {
		res.status(500).send({ message: error.message });
	}
};

readReplies = async (req, res) => {
	try {
		const comments = await Comment.find({
			parrentCommentId: req.params.parrentCommentId,
		})
			.populate({
				path: "userId",
				select: "-tokens -password -phone -email",
			})
			.limit(parseInt(req.query.limit))
			.skip(parseInt(req.query.skip));

		res.send(comments);
	} catch (error) {
		res.status(500).send({ message: error.message });
	}
};

deleteComment = async (req, res) => {
	try {
		const comment = await Comment.findById(req.params.id);
		if (!comment)
			return res
				.status(404)
				.send({ message: "Comment not found with given data." });

		if (!comment.userId.equals(req.user._id)) {
			return res.status(401).send({ message: "_id mismatch with user" });
		}
		await comment.remove();
		await Comment.deleteMany({ parrentCommentId: comment._id });

		res.send({ message: "Removed comment and associated replies" });
	} catch (error) {
		res.status(500).send({ message: error.message });
	}
};

module.exports = { createComment, readComments, readReplies, deleteComment };
