"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateTokens = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const env_1 = require("../config/env");
const generateTokens = (payload, res) => {
    const accessToken = jsonwebtoken_1.default.sign(payload, env_1.env.ACCESS_TOKEN_SECRET, {
        expiresIn: env_1.env.ACCESS_TOKEN_EXPIRES_IN,
    });
    const refreshToken = jsonwebtoken_1.default.sign(payload, env_1.env.REFRESH_TOKEN_SECRET, {
        expiresIn: env_1.env.REFRESH_TOKEN_EXPIRES_IN,
    });
    // Set refresh token in HTTP-only cookie
    res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: env_1.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });
    return accessToken;
};
exports.generateTokens = generateTokens;
