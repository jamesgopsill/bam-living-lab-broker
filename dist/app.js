"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.io = exports.app = void 0;
const koa_1 = __importDefault(require("koa"));
const node_http_1 = __importDefault(require("node:http"));
const socket_io_1 = require("socket.io");
const uuid_1 = require("uuid");
const config_1 = require("./config");
const enums_1 = require("./descriptors/enums");
const log_1 = require("./routers/log");
const ping_1 = require("./routers/ping");
const auth_1 = require("./socket/auth");
const connection_1 = require("./socket/connection");
const contracts_1 = require("./socket/contracts");
// Checking env vars
if (!process.env.DEBUG) {
    console.log("DEBUG on");
}
else {
    config_1.appConfig.debug = process.env.DEBUG === "true";
}
if (!process.env.LOG_TOKEN) {
    console.log("Using default log token. Should only be used for testing.");
}
else {
    config_1.appConfig.logToken = process.env.LOG_TOKEN;
}
if (!process.env.SOCKET_TOKEN) {
    console.log("Using default socket token. Should only be used for testing.");
}
else {
    config_1.appConfig.socketToken = process.env.SOCKET_TOKEN;
}
if (!process.env.STATIC_FILES_DIR) {
    console.log("Using default log dir. Should only be used for testing.");
}
else {
    config_1.appConfig.staticFilesDir = process.env.STATIC_FILES_DIR;
}
config_1.appConfig.sessionUuid = (0, uuid_1.v4)();
(0, log_1.appendToBrokerLog)("Broker starting");
// Initialising the app
const koa = new koa_1.default();
exports.app = node_http_1.default.createServer(koa.callback());
const ioConfig = {
    path: "/socket/",
    maxHttpBufferSize: 1e8,
    cors: {
        origin: "*",
    },
};
exports.io = new socket_io_1.Server(exports.app, ioConfig);
// Configuring the app
koa.use(ping_1.router.routes());
koa.use(ping_1.router.allowedMethods());
koa.use(log_1.router.routes());
koa.use(log_1.router.allowedMethods());
exports.io.use(auth_1.auth);
exports.io.on(enums_1.IoServerEvents.CONNECTION, connection_1.connection);
exports.app.on("close", () => {
    clearInterval(contracts_1.contractSaveInterval);
});
