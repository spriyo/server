const { commonRouter } = require("../common/allRoute");
const { websiteRouter } = require("../website/v1/routes/allroute");

const routes = {
	websiteV1: (app) => {
		app.use("/website/v1", websiteRouter);
	},
	common: (app) => {
		app.use("/common", commonRouter);
	},
};

module.exports = routes;
