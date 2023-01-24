import type { JSONSchemaType } from "ajv"
import Ajv from "ajv"
import type { AllMessage, DirectMessage } from "../definitions/interfaces"

const allMsgSchema: JSONSchemaType<AllMessage> = {
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
}

const directMsgSchema: JSONSchemaType<DirectMessage> = {
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
}

const ajv = new Ajv()
export const validateDirectMsg = ajv.compile(directMsgSchema)
export const validateAllMsg = ajv.compile(allMsgSchema)
