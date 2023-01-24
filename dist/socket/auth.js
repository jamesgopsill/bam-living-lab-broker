"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.auth = void 0;
const app_1 = require("../app");
const auth = (socket, next) => {
    if (!socket.handshake.auth.token) {
        const err = new Error("No authorisation token provided");
        next(err);
    }
    if (!socket.handshake.headers["agent-type"]) {
        const err = new Error("No agent type provided");
        next(err);
    }
    if (!socket.handshake.headers["group-key"]) {
        const err = new Error("No group key provided");
        next(err);
    }
    const token = socket.handshake.auth.token;
    if (token != app_1.appConfig.socketToken) {
        const err = new Error("Not authorised");
        next(err);
    }
    if (typeof socket.handshake.headers["agent-type"] == "string" &&
        !["machine", "job"].includes(socket.handshake.headers["agent-type"])) {
        const err = new Error("Wrong agent type");
        next(err);
    }
    next();
};
exports.auth = auth;
