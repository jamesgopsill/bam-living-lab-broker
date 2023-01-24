"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.appendToBrokerLog = exports.appendToMessagingLog = exports.router = void 0;
const router_1 = __importDefault(require("@koa/router"));
const fs_1 = require("fs");
const koa_send_1 = __importDefault(require("koa-send"));
const app_1 = require("../app");
const enums_1 = require("../definitions/enums");
const logFileNames = [
    enums_1.Logs.BROKER,
    enums_1.Logs.MESSAGING,
    enums_1.Logs.MESSAGING_NO_GCODE,
];
exports.router = new router_1.default();
exports.router.get("/logs/:fname", async (ctx, _) => {
    if (typeof ctx.headers["authorization"] !== "string") {
        ctx.throw(401, "No authorization token.");
    }
    if (ctx.headers["authorization"] != app_1.appConfig.logToken) {
        console.log("Do not match", ctx.headers["authorization"], app_1.appConfig.logToken);
        ctx.throw(401, "Not authorized");
    }
    if (!logFileNames.includes(ctx.params.fname)) {
        ctx.throw(404, "File does not exist");
    }
    const abspath = `${app_1.appConfig.staticFilesDir}/${ctx.params.fname}`;
    await (0, koa_send_1.default)(ctx, abspath, {
        root: "/",
    });
});
const appendToMessagingLog = (msg, socket) => {
    let groupKey = "";
    if (typeof socket.handshake.headers["group-key"] == "string") {
        groupKey = socket.handshake.headers["group-key"];
    }
    let agentType = "";
    if (typeof socket.handshake.headers["agent-type"] == "string") {
        agentType = socket.handshake.headers["agent-type"];
    }
    let entry = {
        brokerSession: app_1.appConfig.sessionUuid,
        group: groupKey,
        fromAgentType: agentType,
        msg: msg,
        date: new Date(),
    };
    const messagingFilePath = `${app_1.appConfig.staticFilesDir}/${enums_1.Logs.MESSAGING}`;
    (0, fs_1.appendFile)(messagingFilePath, JSON.stringify(entry) + "\n", { encoding: "utf-8" }, (err) => {
        if (err)
            console.log(err);
    });
    //@ts-ignore
    if (msg.body && msg.body.gcode) {
        //@ts-ignore
        entry.msg.body.gcode = "";
    }
    const messagingNoGcodeFilePath = `${app_1.appConfig.staticFilesDir}/${enums_1.Logs.MESSAGING_NO_GCODE}`;
    (0, fs_1.appendFile)(messagingNoGcodeFilePath, JSON.stringify(entry) + "\n", { encoding: "utf-8" }, (err) => {
        if (err)
            console.log(err);
    });
};
exports.appendToMessagingLog = appendToMessagingLog;
const appendToBrokerLog = (msg) => {
    const entry = {
        brokerSession: app_1.appConfig.sessionUuid,
        date: new Date(),
        msg: msg,
    };
    const brokerLogFilePath = `${app_1.appConfig.staticFilesDir}/${enums_1.Logs.BROKER}`;
    (0, fs_1.appendFile)(brokerLogFilePath, JSON.stringify(entry) + "\n", { encoding: "utf-8" }, (err) => {
        if (err)
            console.log(err);
    });
};
exports.appendToBrokerLog = appendToBrokerLog;
