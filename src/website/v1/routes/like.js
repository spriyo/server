const router = require("express").Router();
const { likePost, unLikePost, getLikedAssets } = require("../controllers/like");
const auth = require("../middlewares/auth");

router.get("/likes", auth, getLikedAssets);

router.post("/likes/:assetId/like", auth, likePost);

router.post("/likes/:assetId/unlike", auth, unLikePost);

module.exports = router;
