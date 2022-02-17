const Test = require("../../../models/test");

async function getTests(req, res) {
	const tests = await Test.find();
	res.send({ tests });
}

module.exports = { getTests };
