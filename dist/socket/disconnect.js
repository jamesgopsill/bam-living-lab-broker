"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.disconnect = void 0;
const config_1 = require("../config");
function disconnect() {
    if (config_1.appConfig.debug)
        console.log(`Disconnected: ${this.id}`);
}
exports.disconnect = disconnect;
