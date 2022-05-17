const router = require("express").Router();
const auth = require("../middlewares/auth");
const { createTag, readTags } = require("../controllers/tag");

router.post("/tags", auth, createTag);

router.get("/tags", readTags);

module.exports = router;
