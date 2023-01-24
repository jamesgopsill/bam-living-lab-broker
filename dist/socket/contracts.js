"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.contractSaveInterval = exports.getContract = exports.postContract = exports.loadContracts = exports.contracts = void 0;
const node_fs_1 = require("node:fs");
const app_1 = require("../app");
const enums_1 = require("../definitions/enums");
exports.contracts = {};
const loadContracts = () => {
    const contractsFile = `${app_1.appConfig.staticFilesDir}/${enums_1.Logs.CONTRACTS}`;
    if ((0, node_fs_1.existsSync)(contractsFile)) {
        exports.contracts = JSON.parse((0, node_fs_1.readFileSync)(contractsFile, "utf8"));
    }
};
exports.loadContracts = loadContracts;
function postContract(msg) {
    const update = {
        id: this.id,
        msg: msg.msg,
        date: new Date(),
    };
    if (exports.contracts[msg.contractId]) {
        exports.contracts[msg.contractId].push(update);
    }
    else {
        exports.contracts[msg.contractId] = [update];
    }
}
exports.postContract = postContract;
function getContract(id) {
    if (exports.contracts[id]) {
        this.emit(enums_1.SocketEvents.GET_CONTRACT, exports.contracts[id]);
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
    const contractsFile = `${app_1.appConfig.staticFilesDir}/${enums_1.Logs.CONTRACTS}`;
    (0, node_fs_1.writeFile)(contractsFile, JSON.stringify(exports.contracts), {
        encoding: "utf-8",
    }, (err) => {
        if (err)
            console.log(err);
    });
}, 10000);
