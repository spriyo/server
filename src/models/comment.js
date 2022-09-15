const mongoose = require("mongoose");

const CommentSchema = new mongoose.Schema(
	{
		nft_id: {
			type: mongoose.Types.ObjectId,
			ref: "NFT",
			required: true,
		},
		userId: {
			type: mongoose.Types.ObjectId,
			ref: "User",
			required: true,
		},
		parrentCommentId: {
			type: mongoose.Types.ObjectId,
			ref: "Comment",
			default: null,
		},
		content: {
			type: String,
			required: true,
			default: "",
		},
	},
	{
		timestamps: true,
	}
);

CommentSchema.virtual("replies", {
	ref: "Comment",
	localField: "_id",
	foreignField: "parrentCommentId",
});

const Comment = new mongoose.model("Comment", CommentSchema);

module.exports = Comment;
