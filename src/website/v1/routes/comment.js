const router = require("express").Router();

const auth = require("../middlewares/auth");

const {
	createComment,
	readComments,
	readReplies,
	deleteComment,
} = require("../controllers/comment");

// Create comment
router.post("/comments", auth, createComment);

// Read comments
router.get("/comments/:nftid", readComments);

// Read replies
router.get("/comments/replies/:parrentCommentId", readReplies);

// Delete comment
router.delete("/comments/:id", auth, deleteComment);

module.exports = router;
