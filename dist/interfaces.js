"use strict";
exports.__esModule = true;
exports.MessageProtocols = void 0;
/**
 * The protocols that an agent can submit and receive messages on.
 */
var MessageProtocols;
(function (MessageProtocols) {
    MessageProtocols["DIRECT"] = "direct";
    MessageProtocols["ALL_MACHINES"] = "all_machines";
    MessageProtocols["ALL_JOBS"] = "all_jobs";
    MessageProtocols["MESSAGE_ERROR"] = "message_error";
    MessageProtocols["CONNECT"] = "connect";
    MessageProtocols["CONNECT_ERROR"] = "connect_error";
    MessageProtocols["STATS"] = "stats";
})(MessageProtocols = exports.MessageProtocols || (exports.MessageProtocols = {}));
