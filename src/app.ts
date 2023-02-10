import acme from "acme-client"
import { existsSync, readFileSync, writeFile } from "node:fs"
import type { Server as HttpServer } from "node:http"
import http from "node:http"
import type { Server as HttpsServer } from "node:https"
import https from "node:https"
import selfsigned from "selfsigned"
import { Server as IoServer } from "socket.io"
import { v4 as uuidv4 } from "uuid"
import { IoServerEvents } from "./definitions/enums"
import { koa } from "./koa"
import { appendToBrokerLog } from "./routers/log"
import { auth } from "./socket/auth"
import { connection } from "./socket/connection"
import { contractSaveInterval, loadContracts } from "./socket/contracts"

export interface AppOptions {
	debug: boolean
	logToken: string
	socketToken: string
	staticFilesDir: string
	sessionUuid: string
}

export let app: HttpServer | HttpsServer
export let io: IoServer
export let appConfig: AppOptions = {
	debug: true,
	socketToken: "test",
	logToken: "test",
	staticFilesDir: "",
	sessionUuid: "",
}

export const createApp = async (opts: AppOptions) => {
	appConfig.debug = opts.debug
	appConfig.logToken = opts.logToken
	appConfig.socketToken = opts.socketToken
	appConfig.staticFilesDir = opts.staticFilesDir
	appConfig.sessionUuid = uuidv4()

	appendToBrokerLog("Broker starting")

	app = http.createServer(koa.callback())

	const ioConfig = {
		path: "/socket/",
		maxHttpBufferSize: 1e8, // 100MB
		cors: {
			origin: "*",
		},
	}
	io = new IoServer(app, ioConfig)

	io.use(auth)
	io.on(IoServerEvents.CONNECTION, connection)

	loadContracts()

	app.on("close", () => {
		clearInterval(contractSaveInterval)
	})

	process.on("SIGINT", () => {
		console.log("SIGINT called")
		io.close()
		app.close()
	})

	return app
}
