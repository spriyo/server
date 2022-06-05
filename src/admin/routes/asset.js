const router = require("express").Router();
const auth = require("../middlewares/auth");
const {
	importAsset,
	deleteContractItems,
	deleteContractItem,
} = require("../controllers/asset");

// Import Item
router.post("/assets/import", auth, importAsset);

// Delete Item
router.delete("/assets/delete/item", auth, deleteContractItem);

// Delete Items
router.delete("/assets/delete/contract", auth, deleteContractItems);

module.exports = router;
