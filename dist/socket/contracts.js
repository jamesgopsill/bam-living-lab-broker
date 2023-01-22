"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.contractSaveInterval = exports.getContract = exports.postContract = void 0;
const node_fs_1 = require("node:fs");
const config_1 = require("../config");
const enums_1 = require("../descriptors/enums");
let contracts = {};
const contractsFile = `${config_1.appConfig.staticFilesDir}/${enums_1.Logs.CONTRACTS}`;
if ((0, node_fs_1.existsSync)(contractsFile)) {
    contracts = JSON.parse((0, node_fs_1.readFileSync)(contractsFile, "utf8"));
}
function postContract(msg) {
    const update = {
        id: this.id,
        msg: msg.msg,
        date: new Date(),
    };
    if (contracts[msg.contractId]) {
        contracts[msg.contractId].push(update);
    }
    else {
        contracts[msg.contractId] = [update];
    }
}
exports.postContract = postContract;
function getContract(id) {
    if (contracts[id]) {
        this.emit(enums_1.SocketEvents.GET_CONTRACT, contracts[id]);
    }
    else {
        this.emit(enums_1.SocketEvents.MESSAGE_ERROR, "No contract found");
    }
}
exports.getContract = getContract;
/**
 * Saves the contracts json to disk every XX seconds for a back up and logging.
 * Interval cleared on http close.
 */
exports.contractSaveInterval = setInterval(() => {
    console.log("Saving Contracts");
    (0, node_fs_1.writeFile)(contractsFile, JSON.stringify(contracts), (err) => {
        if (err)
            console.log(err);
    });
}, 10000);
