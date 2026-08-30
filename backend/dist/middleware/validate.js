"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validate = void 0;
const catchAsync_1 = require("../utils/catchAsync");
const validate = (schema) => (0, catchAsync_1.catchAsync)(async (req, res, next) => {
    try {
        await schema.parseAsync({
            body: req.body,
            query: req.query,
            params: req.params,
        });
        next();
    }
    catch (error) {
        next(error);
    }
});
exports.validate = validate;
