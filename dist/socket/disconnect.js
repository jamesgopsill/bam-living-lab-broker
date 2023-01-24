"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.disconnect = void 0;
const app_1 = require("../app");
function disconnect() {
    if (app_1.appConfig.debug)
        console.log(`Disconnected: ${this.id}`);
}
exports.disconnect = disconnect;
