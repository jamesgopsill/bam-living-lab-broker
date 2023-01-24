"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Logs = exports.AgentTypes = exports.SocketEvents = exports.IoServerEvents = void 0;
var IoServerEvents;
(function (IoServerEvents) {
    IoServerEvents["CONNECTION"] = "connection";
})(IoServerEvents = exports.IoServerEvents || (exports.IoServerEvents = {}));
var SocketEvents;
(function (SocketEvents) {
    SocketEvents["DISCONNECT"] = "disconnect";
    SocketEvents["DIRECT"] = "direct";
    SocketEvents["ALL_MACHINES"] = "all_machines";
    SocketEvents["ALL_JOBS"] = "all_jobs";
    SocketEvents["MESSAGE_ERROR"] = "message_error";
    SocketEvents["CONNECT"] = "connect";
    SocketEvents["CONNECT_ERROR"] = "connect_error";
    SocketEvents["POST_CONTRACT"] = "post_contract";
    SocketEvents["GET_CONTRACT"] = "get_contract";
})(SocketEvents = exports.SocketEvents || (exports.SocketEvents = {}));
var AgentTypes;
(function (AgentTypes) {
    AgentTypes["MACHINE"] = "machine";
    AgentTypes["JOB"] = "job";
})(AgentTypes = exports.AgentTypes || (exports.AgentTypes = {}));
var Logs;
(function (Logs) {
    Logs["BROKER"] = "broker.log";
    Logs["MESSAGING"] = "messaging.log";
    Logs["MESSAGING_NO_GCODE"] = "messaging_no_gcode.log";
    Logs["CONTRACTS"] = "contracts.json";
})(Logs = exports.Logs || (exports.Logs = {}));
