import Router from "@koa/router"
import { appendFile, existsSync, mkdirSync, writeFileSync } from "fs"
import send from "koa-send"
import type { Socket } from "socket.io"
import { appConfig } from "../config"
import { Logs } from "../descriptors/enums"
import type {
	AllMessage,
	BrokerLogEntry,
	DirectMessage,
	MessagingLogEntry,
} from "../descriptors/interfaces"

const logFileNames: string[] = [
	Logs.BROKER,
	Logs.MESSAGING,
	Logs.MESSAGING_NO_GCODE,
]
for (const fname of logFileNames) {
	const fullPath = `${appConfig.staticFilesDir}/${fname}`
	if (!existsSync(fullPath)) {
		if (!existsSync(appConfig.staticFilesDir)) {
			mkdirSync(appConfig.staticFilesDir)
		}
		writeFileSync(fullPath, "")
	}
}
const brokerLogFilePath = `${appConfig.staticFilesDir}/${Logs.BROKER}`
const messagingFilePath = `${appConfig.staticFilesDir}/${Logs.MESSAGING}`
const messagingNoGcodeFilePath = `${appConfig.staticFilesDir}/${Logs.MESSAGING_NO_GCODE}`

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

	const relpath = `${appConfig.staticFilesDir}/${ctx.params.fname}`
	await send(ctx, relpath)
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
	appendFile(messagingFilePath, JSON.stringify(entry) + "\n", (err) => {
		if (err) console.log(err)
	})

	//@ts-ignore
	if (msg.body && msg.body.gcode) {
		//@ts-ignore
		entry.msg.body.gcode = ""
	}

	appendFile(messagingNoGcodeFilePath, JSON.stringify(entry) + "\n", (err) => {
		if (err) console.log(err)
	})
}

export const appendToBrokerLog = (msg: string) => {
	const entry: BrokerLogEntry = {
		brokerSession: appConfig.sessionUuid,
		date: new Date(),
		msg: msg,
	}
	appendFile(brokerLogFilePath, JSON.stringify(entry) + "\n", (err) => {
		if (err) console.log(err)
	})
}
