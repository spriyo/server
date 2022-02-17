const mongoose = require("mongoose");

const TestSchema = new mongoose.Schema({
	name: {
		type: String,
		default: "Jonh Doe",
	},
});

const Test = mongoose.model("Test", TestSchema);

module.exports = Test;
