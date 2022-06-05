const auth = (req, res, next) => {
	try {
		if (req.query.adminpass !== process.env.ADMIN_PASS) {
			throw new Error();
		}
		next();
	} catch (error) {
		res.status(404).send({ message: "Please authenticate" });
	}
};

module.exports = auth;
