"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.connection = void 0;
const app_1 = require("../app");
const enums_1 = require("../definitions/enums");
const all_jobs_msg_1 = require("./all-jobs-msg");
const all_machines_msg_1 = require("./all-machines-msg");
const direct_msg_1 = require("./direct-msg");
const disconnect_1 = require("./disconnect");
const connection = (socket) => {
    if (app_1.appConfig.debug)
        console.log(`new-connection: ${socket.id}`);
    const agentType = socket.handshake.headers["agent-type"];
    if (typeof agentType == "string") {
        socket.join(agentType);
    }
    else {
        console.log("Should not get here!");
    }
    socket.on(enums_1.SocketEvents.DISCONNECT, disconnect_1.disconnect);
    socket.on(enums_1.SocketEvents.ALL_JOBS, all_jobs_msg_1.allJobsMsg);
    socket.on(enums_1.SocketEvents.ALL_MACHINES, all_machines_msg_1.allMachinesMsg);
    socket.on(enums_1.SocketEvents.DIRECT, direct_msg_1.directMsg);
};
exports.connection = connection;
