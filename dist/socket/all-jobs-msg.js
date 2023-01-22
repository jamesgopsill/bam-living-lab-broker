"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.allJobsMsg = void 0;
const app_1 = require("../app");
const config_1 = require("../config");
const enums_1 = require("../descriptors/enums");
const log_1 = require("../routers/log");
const validate_msg_1 = require("./validate-msg");
function allJobsMsg(msg) {
    if (config_1.appConfig)
        console.log(`${this.id} received direct`);
    if (!(0, validate_msg_1.validateAllMsg)(msg)) {
        this.emit(enums_1.SocketEvents.MESSAGE_ERROR, validate_msg_1.validateAllMsg.errors);
        return;
    }
    (0, log_1.appendToMessagingLog)(msg, this);
    app_1.io.to(enums_1.AgentTypes.JOB).emit(enums_1.SocketEvents.ALL_JOBS, msg);
}
exports.allJobsMsg = allJobsMsg;
