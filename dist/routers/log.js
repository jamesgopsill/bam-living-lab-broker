"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.appendToBrokerLog = exports.appendToMessagingLog = exports.router = void 0;
const router_1 = __importDefault(require("@koa/router"));
const fs_1 = require("fs");
const koa_send_1 = __importDefault(require("koa-send"));
const config_1 = require("../config");
const enums_1 = require("../descriptors/enums");
const logFileNames = [
    enums_1.Logs.BROKER,
    enums_1.Logs.MESSAGING,
    enums_1.Logs.MESSAGING_NO_GCODE,
];
for (const fname of logFileNames) {
    const fullPath = `${config_1.appConfig.staticFilesDir}/${fname}`;
    if (!(0, fs_1.existsSync)(fullPath)) {
        if (!(0, fs_1.existsSync)(config_1.appConfig.staticFilesDir)) {
            (0, fs_1.mkdirSync)(config_1.appConfig.staticFilesDir);
        }
        (0, fs_1.writeFileSync)(fullPath, "");
    }
}
const brokerLogFilePath = `${config_1.appConfig.staticFilesDir}/${enums_1.Logs.BROKER}`;
const messagingFilePath = `${config_1.appConfig.staticFilesDir}/${enums_1.Logs.MESSAGING}`;
const messagingNoGcodeFilePath = `${config_1.appConfig.staticFilesDir}/${enums_1.Logs.MESSAGING_NO_GCODE}`;
exports.router = new router_1.default();
exports.router.get("/logs/:fname", async (ctx, _) => {
    if (typeof ctx.headers["authorization"] !== "string") {
        ctx.throw(401, "No authorization token.");
    }
    if (ctx.headers["authorization"] != config_1.appConfig.logToken) {
        console.log("Do not match", ctx.headers["authorization"], config_1.appConfig.logToken);
        ctx.throw(401, "Not authorized");
    }
    if (!logFileNames.includes(ctx.params.fname)) {
        ctx.throw(404, "File does not exist");
    }
    const relpath = `${config_1.appConfig.staticFilesDir}/${ctx.params.fname}`;
    await (0, koa_send_1.default)(ctx, relpath);
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
        brokerSession: config_1.appConfig.sessionUuid,
        group: groupKey,
        fromAgentType: agentType,
        msg: msg,
        date: new Date(),
    };
    (0, fs_1.appendFile)(messagingFilePath, JSON.stringify(entry) + "\n", (err) => {
        if (err)
            console.log(err);
    });
    //@ts-ignore
    if (msg.body && msg.body.gcode) {
        //@ts-ignore
        entry.msg.body.gcode = "";
    }
    (0, fs_1.appendFile)(messagingNoGcodeFilePath, JSON.stringify(entry) + "\n", (err) => {
        if (err)
            console.log(err);
    });
};
exports.appendToMessagingLog = appendToMessagingLog;
const appendToBrokerLog = (msg) => {
    const entry = {
        brokerSession: config_1.appConfig.sessionUuid,
        date: new Date(),
        msg: msg,
    };
    (0, fs_1.appendFile)(brokerLogFilePath, JSON.stringify(entry) + "\n", (err) => {
        if (err)
            console.log(err);
    });
};
exports.appendToBrokerLog = appendToBrokerLog;
