"use strict";
exports.__esModule = true;
exports.MessageProtocols = void 0;
/**
 * The protocols that an agent can submit and receive messages on.
 */
var MessageProtocols;
(function (MessageProtocols) {
    MessageProtocols["DIRECT"] = "direct";
    MessageProtocols["ALL_MACHINES"] = "all-machines";
    MessageProtocols["ALL_JOBS"] = "all-jobs";
    MessageProtocols["MESSAGE_ERROR"] = "message-error";
})(MessageProtocols = exports.MessageProtocols || (exports.MessageProtocols = {}));
