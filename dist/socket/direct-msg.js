"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.directMsg = void 0;
const app_1 = require("../app");
const config_1 = require("../config");
const enums_1 = require("../descriptors/enums");
const log_1 = require("../routers/log");
const validate_msg_1 = require("./validate-msg");
function directMsg(msg) {
    if (config_1.appConfig.debug)
        console.log(`${this.id} received direct`);
    if (!(0, validate_msg_1.validateDirectMsg)(msg)) {
        this.emit(enums_1.SocketEvents.MESSAGE_ERROR, validate_msg_1.validateDirectMsg.errors);
        return;
    }
    if (config_1.appConfig.debug)
        console.log(msg);
    (0, log_1.appendToMessagingLog)(msg, this);
    app_1.io.to(msg.to).emit(enums_1.SocketEvents.DIRECT, msg);
    return;
}
exports.directMsg = directMsg;
