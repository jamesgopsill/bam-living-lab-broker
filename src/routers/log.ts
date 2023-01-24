import Router from "@koa/router"
import { appendFile } from "fs"
import send from "koa-send"
import type { Socket } from "socket.io"
import { appConfig } from "../app"
import { Logs } from "../definitions/enums"
import type {
	AllMessage,
	BrokerLogEntry,
	DirectMessage,
	MessagingLogEntry,
} from "../definitions/interfaces"

const logFileNames: string[] = [
	Logs.BROKER,
	Logs.MESSAGING,
	Logs.MESSAGING_NO_GCODE,
]

export const router = new Router()

router.get("/logs/:fname", async (ctx, _) => {
	if (typeof ctx.headers["authorization"] !== "string") {
		ctx.throw(401, "No authorization token.")
	}

	if (ctx.headers["authorization"] != appConfig.logToken) {
		console.log(
			"Do not match",
			ctx.headers["authorization"],
			appConfig.logToken
		)
		ctx.throw(401, "Not authorized")
	}

	if (!logFileNames.includes(ctx.params.fname)) {
		ctx.throw(404, "File does not exist")
	}

	const abspath = `${appConfig.staticFilesDir}/${ctx.params.fname}`
	await send(ctx, abspath, {
		root: "/",
	})
})

export const appendToMessagingLog = (
	msg: DirectMessage | AllMessage,
	socket: Socket
) => {
	let groupKey = ""
	if (typeof socket.handshake.headers["group-key"] == "string") {
		groupKey = socket.handshake.headers["group-key"]
	}

	let agentType = ""
	if (typeof socket.handshake.headers["agent-type"] == "string") {
		agentType = socket.handshake.headers["agent-type"]
	}

	let entry: MessagingLogEntry = {
		brokerSession: appConfig.sessionUuid,
		group: groupKey,
		fromAgentType: agentType,
		msg: msg,
		date: new Date(),
	}

	const messagingFilePath = `${appConfig.staticFilesDir}/${Logs.MESSAGING}`
	appendFile(
		messagingFilePath,
		JSON.stringify(entry) + "\n",
		{ encoding: "utf-8" },
		(err) => {
			if (err) console.log(err)
		}
	)

	//@ts-ignore
	if (msg.body && msg.body.gcode) {
		//@ts-ignore
		entry.msg.body.gcode = ""
	}

	const messagingNoGcodeFilePath = `${appConfig.staticFilesDir}/${Logs.MESSAGING_NO_GCODE}`
	appendFile(
		messagingNoGcodeFilePath,
		JSON.stringify(entry) + "\n",
		{ encoding: "utf-8" },
		(err) => {
			if (err) console.log(err)
		}
	)
}

export const appendToBrokerLog = (msg: string) => {
	const entry: BrokerLogEntry = {
		brokerSession: appConfig.sessionUuid,
		date: new Date(),
		msg: msg,
	}
	const brokerLogFilePath = `${appConfig.staticFilesDir}/${Logs.BROKER}`
	appendFile(
		brokerLogFilePath,
		JSON.stringify(entry) + "\n",
		{ encoding: "utf-8" },
		(err) => {
			if (err) console.log(err)
		}
	)
}
