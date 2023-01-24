"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.allMachinesMsg = void 0;
const app_1 = require("../app");
const app_2 = require("../app");
const enums_1 = require("../definitions/enums");
const log_1 = require("../routers/log");
const validate_msg_1 = require("./validate-msg");
function allMachinesMsg(msg) {
    if (app_2.appConfig)
        console.log(`${this.id} received direct`);
    if (!(0, validate_msg_1.validateAllMsg)(msg)) {
        this.emit(enums_1.SocketEvents.MESSAGE_ERROR, validate_msg_1.validateAllMsg.errors);
        return;
    }
    (0, log_1.appendToMessagingLog)(msg, this);
    app_1.io.to(enums_1.AgentTypes.MACHINE).emit(enums_1.SocketEvents.ALL_MACHINES, msg);
}
exports.allMachinesMsg = allMachinesMsg;
