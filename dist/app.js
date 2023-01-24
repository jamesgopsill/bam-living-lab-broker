"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createApp = exports.appConfig = exports.io = exports.app = void 0;
const acme_client_1 = __importDefault(require("acme-client"));
const node_https_1 = __importDefault(require("node:https"));
const node_http_1 = __importDefault(require("node:http"));
const socket_io_1 = require("socket.io");
const uuid_1 = require("uuid");
const enums_1 = require("./definitions/enums");
const log_1 = require("./routers/log");
const auth_1 = require("./socket/auth");
const connection_1 = require("./socket/connection");
const contracts_1 = require("./socket/contracts");
const koa_1 = require("./koa");
const node_fs_1 = require("node:fs");
const contracts_2 = require("./socket/contracts");
exports.appConfig = {
    debug: true,
    socketToken: "test",
    logToken: "test",
    staticFilesDir: "",
    sessionUuid: "",
    ssl: false,
    email: "",
    sslMode: "staging",
    domain: ""
};
const createApp = async (opts) => {
    exports.appConfig.debug = opts.debug;
    exports.appConfig.ssl = opts.ssl;
    exports.appConfig.email = opts.email;
    exports.appConfig.sslMode = opts.sslMode;
    exports.appConfig.logToken = opts.logToken;
    exports.appConfig.socketToken = opts.socketToken;
    exports.appConfig.staticFilesDir = opts.staticFilesDir;
    exports.appConfig.sessionUuid = (0, uuid_1.v4)();
    exports.appConfig.domain = opts.domain;
    (0, log_1.appendToBrokerLog)("Broker starting");
    // Handling HTTPS
    const sslFile = `${exports.appConfig.staticFilesDir}/${exports.appConfig.sslMode}.json`;
    if (exports.appConfig.ssl && (0, node_fs_1.existsSync)(sslFile)) {
        const certInfo = JSON.parse((0, node_fs_1.readFileSync)(sslFile, "utf-8"));
        exports.app = node_https_1.default.createServer(certInfo, koa_1.koa.callback());
    }
    if (exports.appConfig.ssl && !(0, node_fs_1.existsSync)(sslFile)) {
        /* Init client */
        const client = new acme_client_1.default.Client({
            directoryUrl: acme_client_1.default.directory.letsencrypt.staging,
            accountKey: await acme_client_1.default.crypto.createPrivateKey()
        });
        /* Create CSR */
        const [key, csr] = await acme_client_1.default.crypto.createCsr({
            commonName: exports.appConfig.domain
        });
        /* Certificate */
        const cert = await client.auto({
            csr: csr,
            email: exports.appConfig.email,
            termsOfServiceAgreed: true,
            challengeCreateFn: async () => { },
            challengeRemoveFn: async () => { }
        });
        const certInfo = {
            key,
            cert
        };
        exports.app = node_https_1.default.createServer(certInfo, koa_1.koa.callback());
        (0, node_fs_1.writeFile)(sslFile, JSON.stringify(certInfo), {
            encoding: "utf-8"
        }, () => { });
    }
    if (!exports.appConfig.ssl) {
        exports.app = node_http_1.default.createServer(koa_1.koa.callback());
    }
    const ioConfig = {
        path: "/socket/",
        maxHttpBufferSize: 1e8,
        cors: {
            origin: "*",
        },
    };
    exports.io = new socket_io_1.Server(exports.app, ioConfig);
    exports.io.use(auth_1.auth);
    exports.io.on(enums_1.IoServerEvents.CONNECTION, connection_1.connection);
    (0, contracts_2.loadContracts)();
    exports.app.on("close", () => {
        clearInterval(contracts_1.contractSaveInterval);
    });
    return exports.app;
};
exports.createApp = createApp;
