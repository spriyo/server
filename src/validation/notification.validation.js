const joi = require('joi');

exports.createNotificaitonValidation = (req) => {
    let schema = joi.object().keys(Object.assign({
        title: joi.string().required(),
        description: joi.string().required(),
        type: joi.string().optional(),
    }));
    return schema.validate(req, {abortEarly: false});
}