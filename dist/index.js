"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
exports.__esModule = true;
exports.Broker = void 0;
var express_1 = __importDefault(require("express"));
var fs_1 = require("fs");
var http_1 = require("http");
var socket_io_1 = require("socket.io");
var uuid_1 = require("uuid");
__exportStar(require("./interfaces"), exports);
var Broker = /** @class */ (function () {
    /**
     * Constructs an instance of the broker.
     * @param config The parmeters required to configure the broker.
     */
    function Broker(config) {
        /**
         * A unique string that has to be provided in the header of a logs request to access the log files.
         */
        this.accessLogsKey = "";
        /**
         * The path to the folder where the log files will be stored.
         */
        this.logFolderPath = "";
        /**
         * Enable debug logging to the terminal.
         */
        this.debug = false;
        /**
         * The address book for all the connected sockets.
         */
        this.socketBook = {};
        /**
         * Creates a unique session id for each instance of the broker so we can track different sessions in the log.
         */
        this.sessionUuid = (0, uuid_1.v4)();
        /**
         * The express server for log access
         */
        this.app = (0, express_1["default"])();
        /**
         * The http server
         */
        this.httpServer = (0, http_1.createServer)(this.app);
        /**
         * The socket server for brokering the connections between machines and jobs.
         */
        this.io = new socket_io_1.Server(this.httpServer, {
            path: "/socket/",
            maxHttpBufferSize: 1e8
        });
        this.accessLogsKey = config.accessLogsKey;
        this.logFolderPath = config.logFolderPath;
        this.socketKey = config.socketKey;
        if (config.debug) {
            this.debug = config.debug;
        }
        this.configureExpress();
        this.configureIo();
    }
    /**
     * Starts the server.
     */
    Broker.prototype.start = function () {
        this.appendToBrokerLog("broker-starting");
        this.httpServer.listen(3000);
    };
    /**
     * Stops the server
     */
    Broker.prototype.stop = function () {
        this.appendToBrokerLog("broker-stopping");
        this.io.close();
        this.httpServer.close();
    };
    /**
     * Configures the logging functionality of the broker.
     */
    Broker.prototype.configureExpress = function () {
        var _this = this;
        // check if the files exist
        var logFnames = ["broker.log", "messaging.log", "messaging-no-gcode.log"];
        for (var _i = 0, logFnames_1 = logFnames; _i < logFnames_1.length; _i++) {
            var fname = logFnames_1[_i];
            var fullPath = "".concat(this.logFolderPath, "/").concat(fname);
            if (!(0, fs_1.existsSync)(fullPath)) {
                if (!(0, fs_1.existsSync)(this.logFolderPath)) {
                    (0, fs_1.mkdirSync)(this.logFolderPath);
                }
                (0, fs_1.writeFileSync)(fullPath, "");
            }
        }
        if (this.accessLogsKey != "") {
            this.app.use("/logs/:fname", function (req, res, next) {
                if (!req.headers["logs_key"]) {
                    return res.status(401).send();
                }
                if (Array.isArray(req.headers["logs_key"])) {
                    return res.status(401).send();
                }
                if (req.headers["logs_key"] != _this.accessLogsKey) {
                    return res.status(401).send();
                }
                if (logFnames.includes(req.params.fname)) {
                    var path = "".concat(_this.logFolderPath, "/").concat(req.params.fname);
                    return res.sendFile(path, function (err) {
                        if (err) {
                            next(err);
                        }
                    });
                }
                return res.status(404).send();
            });
        }
    };
    /**
     * Configures socket.io for accepting connections.
     */
    Broker.prototype.configureIo = function () {
        var _this = this;
        if (this.debug)
            console.log("configuring-io");
        this.io.on("connection", function (socket) {
            _this.configureSocket(socket);
        });
        this.io.use(function (socket, next) {
            var token = socket.handshake.auth.token;
            if (token != _this.socketKey) {
                var err = new Error("Not authorised");
                _this.appendToBrokerLog("socket-not-authorised: ".concat(socket.id));
                next(err);
            }
            next();
        });
    };
    /**
     * Configures an incoming socket to broker connections to other sockets.
     */
    Broker.prototype.configureSocket = function (socket) {
        var _this = this;
        if (this.debug)
            console.log("new-connection: ".concat(socket.id));
        this.appendToBrokerLog("new-connection: ".concat(socket.id));
        // Add socket to the address book
        this.socketBook[socket.id] = socket;
        socket.on("disconnect", function () {
            if (_this.debug)
                console.log("disconnected: ".concat(socket.id));
            _this.appendToBrokerLog("disconnected: ".concat(socket.id));
            delete _this.socketBook[socket.id];
        });
        socket.on("join-the-machine-room", function () {
            if (_this.debug)
                console.log("joined-machine-room: ".concat(socket.id));
            _this.appendToBrokerLog("joined-machine-room: ".concat(socket.id));
            socket.join("machine-room");
        });
        // Pass-through communications
        socket.on("p2p-comm", function (msg) {
            if (_this.debug)
                console.log("p2p-comm: ".concat(msg.header));
            if (msg.header && msg.header.toId) {
                _this.appendToMessagingLog(msg);
                // Check if the key is in the socketBook
                if (msg.header.toId in _this.socketBook) {
                    // forward the message
                    _this.socketBook[msg.header.toId].emit("p2p-comm", msg);
                }
                else {
                    // [TODO] return an error
                }
            }
            else {
                console.log("malformed data");
                // [TODO] return error
            }
        });
    };
    /**
     * Append to the broker log.
     * @param msg
     */
    Broker.prototype.appendToBrokerLog = function (msg) {
        var path = "".concat(this.logFolderPath, "/broker.log");
        var entry = {
            sessionUuid: this.sessionUuid,
            date: new Date(),
            entry: msg
        };
        (0, fs_1.appendFile)(path, JSON.stringify(entry) + "\n", function (err) {
            if (err)
                console.log(err);
        });
    };
    /**
     * Append to the messaging log both with and without gcode.
     * @param msg
     */
    Broker.prototype.appendToMessagingLog = function (msg) {
        var messagingFilePath = "".concat(this.logFolderPath, "/messaging.log");
        var entry = {
            sessionUuid: this.sessionUuid,
            msg: msg,
            date: new Date()
        };
        (0, fs_1.appendFile)(messagingFilePath, JSON.stringify(entry) + "\n", function (err) {
            if (err)
                console.log(err);
        });
        var messagingNoGcodeFilePath = "".concat(this.logFolderPath, "/messaging-no-gcode.log");
        if (msg.body && msg.body.gcode) {
            entry.msg.body.gcode = "";
        }
        (0, fs_1.appendFile)(messagingNoGcodeFilePath, JSON.stringify(entry) + "\n", function (err) {
            if (err)
                console.log(err);
        });
    };
    return Broker;
}());
exports.Broker = Broker;
