// const { adminRouter } = require("../admin/routes/allroute");
// const { serviceRouter } = require("../service/routes/allroute");
const { websiteRouter } = require("../website/v1/routes/allroute");

const routes = {
	websiteV1: (app) => {
		app.use("/website/v1", websiteRouter);
	},
	admin: (app) => {
		app.use("/admin", adminRouter);
	},
	service: (app) => {
		app.use("/service", serviceRouter);
	},
};

module.exports = routes;
