import acme from "acme-client"
import https from "node:https"
import type { Server as HttpsServer } from "node:https"
import http from "node:http"
import type { Server as HttpServer } from "node:http"
import { Server as IoServer } from "socket.io"
import { v4 as uuidv4 } from "uuid"
import { IoServerEvents } from "./definitions/enums"
import { appendToBrokerLog } from "./routers/log"
import { auth } from "./socket/auth"
import { connection } from "./socket/connection"
import { contractSaveInterval } from "./socket/contracts"
import { koa } from "./koa"
import { existsSync, readFileSync, writeFile } from "node:fs"
import { loadContracts } from "./socket/contracts"

export interface AppOptions {
	debug: boolean 
	ssl: boolean
	email: string
	sslMode: string
	logToken: string
	socketToken: string
	staticFilesDir: string
	domain: string
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
	ssl: false,
	email: "",
	sslMode: "staging",
	domain: ""
}

export const createApp = async (opts: AppOptions) => {

	appConfig.debug = opts.debug
	appConfig.ssl = opts.ssl
	appConfig.email = opts.email
	appConfig.sslMode = opts.sslMode
	appConfig.logToken = opts.logToken
	appConfig.socketToken = opts.socketToken
	appConfig.staticFilesDir = opts.staticFilesDir
	appConfig.sessionUuid = uuidv4()
	appConfig.domain = opts.domain

	appendToBrokerLog("Broker starting")

	// Handling HTTPS
	const sslFile = `${appConfig.staticFilesDir}/${appConfig.sslMode}.json`
	if (appConfig.ssl && existsSync(sslFile)) {
		const certInfo = JSON.parse(readFileSync(sslFile, "utf-8"))
		app = https.createServer(certInfo, koa.callback())
	}

	if (appConfig.ssl && !existsSync(sslFile)) {
		/* Init client */
		const client = new acme.Client({
			directoryUrl: acme.directory.letsencrypt.staging,
			accountKey: await acme.crypto.createPrivateKey()
		})
	
		/* Create CSR */
		const [key, csr] = await acme.crypto.createCsr({
			commonName: appConfig.domain
		})
	
		/* Certificate */
		const cert = await client.auto({
			csr: csr,
			email: appConfig.email,
			termsOfServiceAgreed: true,
			challengeCreateFn: async () => {},
			challengeRemoveFn: async () => {}
		})

		const certInfo = {
			key,
			cert
		}

		app = https.createServer(certInfo, koa.callback())
		writeFile(sslFile, JSON.stringify(certInfo), {
			encoding: "utf-8"}, () => {})
	}

	if (!appConfig.ssl) {
		app = http.createServer(koa.callback())
	}

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

	return app
}