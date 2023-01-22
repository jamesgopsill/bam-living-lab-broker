"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateAllMsg = exports.validateDirectMsg = void 0;
const ajv_1 = __importDefault(require("ajv"));
const allMsgSchema = {
    type: "object",
    properties: {
        from: {
            type: "string",
        },
        subject: {
            type: "string",
        },
        body: {
            type: "object",
        },
    },
    required: ["from", "subject", "body"],
    additionalProperties: false,
};
const directMsgSchema = {
    type: "object",
    properties: {
        from: {
            type: "string",
        },
        to: {
            type: "string",
        },
        subject: {
            type: "string",
        },
        body: {
            type: "object",
        },
    },
    required: ["from", "to", "subject", "body"],
    additionalProperties: false,
};
const ajv = new ajv_1.default();
exports.validateDirectMsg = ajv.compile(directMsgSchema);
exports.validateAllMsg = ajv.compile(allMsgSchema);
