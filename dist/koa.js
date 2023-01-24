"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.koa = void 0;
const koa_1 = __importDefault(require("koa"));
const ping_1 = require("./routers/ping");
const log_1 = require("./routers/log");
exports.koa = new koa_1.default();
exports.koa.use(ping_1.router.routes());
exports.koa.use(ping_1.router.allowedMethods());
exports.koa.use(log_1.router.routes());
exports.koa.use(log_1.router.allowedMethods());
