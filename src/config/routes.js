const { adminRouter } = require("../admin/routes");
const { commonRouter } = require("../common/allRoute");
const { websiteRouter } = require("../website/v1/routes/allroute");
const { v2WebsiteRouter } = require("../website/v2/routes");

const routes = {
	websiteV1: (app) => {
		app.use("/website/v1", websiteRouter);
	},
	websiteV2: (app) => {
		app.use("/website/v2", v2WebsiteRouter);
	},
	common: (app) => {
		app.use("/common", commonRouter);
	},
	admin: (app) => {
		app.use("/admin", adminRouter);
	},
};

module.exports = routes;
