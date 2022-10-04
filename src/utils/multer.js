// Multer Configuration
const multer = require("multer");

var multerS3 = require("multer-s3");
const s3 = require("./s3");

const upload = {
	displayImage: multer({
		limits: {
			fileSize: 2000000,
		},
		fileFilter(req, file, cb) {
			if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
				cb(new Error("please upload only jpg,jpeg or png file format images"));
			}
			cb(undefined, true);
		},
		storage: multerS3({
			s3: s3,
			bucket: process.env.AWS_BUCKET,
			contentType: multerS3.AUTO_CONTENT_TYPE,
			metadata: function (req, file, cb) {
				cb(null, { fieldName: file.fieldname });
			},
			acl: "public-read",
			key: function (req, file, cb) {
				let path = `assets/${req.user._id}/${Date.now()}-${file.fieldname}-${
					file.originalname
				}`;
				cb(null, path);
			},
		}),
	}),
	assetImage: multer({
		limits: {
			fileSize: 20000000,
		},
		fileFilter(req, file, cb) {
			if (!file.originalname.match(/\.(jpg|jpeg|png|mp4)$/)) {
				cb(
					new Error("please upload only jpg,jpeg,png or mp4 file format images")
				);
			}
			cb(undefined, true);
		},
		storage: multerS3({
			s3: s3,
			bucket: process.env.AWS_BUCKET,
			contentType: multerS3.AUTO_CONTENT_TYPE,
			metadata: function (req, file, cb) {
				cb(null, { fieldName: file.fieldname });
			},
			acl: "public-read",
			key: function (req, file, cb) {
				let path = `assets/${req.user._id}/${Date.now()}-${file.fieldname}-${
					file.originalname
				}`;
				cb(null, path);
			},
		}),
	}),
	collection: multer({
		limits: {
			fileSize: 1000000,
		},
		fileFilter(req, file, cb) {
			if (!file.originalname.match(/\.(jpg|jpeg|png|mp4|gif)$/)) {
				cb(
					new Error("please upload only jpg,jpeg,png or mp4 file format images")
				);
			}
			cb(undefined, true);
		},
		storage: multerS3({
			s3: s3,
			bucket: process.env.AWS_BUCKET,
			contentType: multerS3.AUTO_CONTENT_TYPE,
			metadata: function (req, file, cb) {
				cb(null, { fieldName: file.fieldname });
			},
			acl: "public-read",
			key: function (req, file, cb) {
				let path = `collections/${Date.now()}-${file.fieldname}-${
					file.originalname
				}`;
				cb(null, path);
			},
		}),
	}),
	bannerImage: multer({
		limits: {
			fileSize: 1000000,
		},
		fileFilter(req, file, cb) {
			if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
				cb(new Error("please upload only jpg,jpeg or png file format images"));
			}
			cb(undefined, true);
		},
		storage: multerS3({
			s3: s3,
			bucket: process.env.AWS_BUCKET,
			contentType: multerS3.AUTO_CONTENT_TYPE,
			metadata: function (req, file, cb) {
				cb(null, { fieldName: file.fieldname });
			},
			acl: "public-read",
			key: function (req, file, cb) {
				let path = `banners/${Date.now()}-${file.fieldname}-${
					file.originalname
				}`;
				cb(null, path);
			},
		}),
	}),
	dropImage: multer({
		limits: {
			fileSize: 2000000,
		},
		fileFilter(req, file, cb) {
			if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
				cb(new Error("please upload only jpg,jpeg or png file format images"));
			}
			cb(undefined, true);
		},
		storage: multerS3({
			s3: s3,
			bucket: process.env.AWS_BUCKET,
			contentType: multerS3.AUTO_CONTENT_TYPE,
			metadata: function (req, file, cb) {
				cb(null, { fieldName: file.fieldname });
			},
			acl: "public-read",
			key: function (req, file, cb) {
				let path = `drops/${Date.now()}-${file.fieldname}-${file.originalname}`;
				cb(null, path);
			},
		}),
	}),
};

module.exports = { upload };
