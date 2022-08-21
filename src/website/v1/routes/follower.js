const route = require("express").Router();
const auth = require("../middlewares/auth");
const {
	followUser,
	getFollowers,
	getFollowing,
} = require("../controllers/follower");

route.get("/follow/followers/:userid", getFollowers);

route.get("/follow/following/:userid", getFollowing);

route.post("/follow/:id", auth, followUser);

module.exports = route;
