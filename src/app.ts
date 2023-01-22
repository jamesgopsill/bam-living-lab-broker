import Koa from "koa"
import http from "node:http"
import { Server as Io } from "socket.io"
import { v4 as uuidv4 } from "uuid"
import { appConfig } from "./config"
import { IoServerEvents } from "./descriptors/enums"
import { appendToBrokerLog, router as logRouter } from "./routers/log"
import { router as pingRouter } from "./routers/ping"
import { auth } from "./socket/auth"
import { connection } from "./socket/connection"
import { contractSaveInterval } from "./socket/contracts"

// Checking env vars

if (!process.env.DEBUG) {
	console.log("DEBUG on")
} else {
	appConfig.debug = process.env.DEBUG === "true"
}
if (!process.env.LOG_TOKEN) {
	console.log("Using default log token. Should only be used for testing.")
} else {
	appConfig.logToken = process.env.LOG_TOKEN
}
if (!process.env.SOCKET_TOKEN) {
	console.log("Using default socket token. Should only be used for testing.")
} else {
	appConfig.socketToken = process.env.SOCKET_TOKEN
}
if (!process.env.STATIC_FILES_DIR) {
	console.log("Using default log dir. Should only be used for testing.")
} else {
	appConfig.staticFilesDir = process.env.STATIC_FILES_DIR
}

appConfig.sessionUuid = uuidv4()

appendToBrokerLog("Broker starting")

// Initialising the app

const koa = new Koa()
export const app = http.createServer(koa.callback())
const ioConfig = {
	path: "/socket/",
	maxHttpBufferSize: 1e8, // 100MB
	cors: {
		origin: "*",
	},
}
export const io = new Io(app, ioConfig)

// Configuring the app

koa.use(pingRouter.routes())
koa.use(pingRouter.allowedMethods())
koa.use(logRouter.routes())
koa.use(logRouter.allowedMethods())

io.use(auth)
io.on(IoServerEvents.CONNECTION, connection)

app.on("close", () => {
	clearInterval(contractSaveInterval)
})
