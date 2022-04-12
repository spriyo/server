const Comment = require("../../../models/comment");
const { Asset } = require("../../../models/asset");

createComment = async (req, res) => {
	// Add ParentCommentId to comment(reply) to ParentComment
	try {
		// Check if Asset Exists
		const asset = await Asset.findById(req.body.assetId);
		if (!asset) return res.status(404).send({ message: "Invalid asset _id." });

		const comment = new Comment(req.body);
		comment.userId = req.user._id;
		await comment.save();
		await comment.populate("userId").execPopulate();

		res.status(201).send(comment);
	} catch (error) {
		res.status(500).send({ message: error.message });
	}
};

readComments = async (req, res) => {
	try {
		const comments = await Comment.find({
			assetId: req.params.assetId,
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
			.populate("userId", "-tokens -password -phone -email");

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
