import express, { Express } from "express"
import { appendFile, existsSync, mkdirSync, writeFileSync } from "fs"
import { createServer, Server as HttpServer } from "http"
import { Server as SocketServer, Socket } from "socket.io"
import { v4 as uuidv4 } from "uuid"
import {
	BrokerConfig,
	BrokerLogEntry,
	MessagingLogEntry,
	SocketBook,
} from "./interfaces"

export * from "./interfaces"

export class Broker {
	/**
	 * A unique string that has to be provided in the header of a logs request to access the log files.
	 */
	accessLogsKey = ""
	/**
	 * The path to the folder where the log files will be stored.
	 */
	logFolderPath = ""
	/**
	 * Enable debug logging to the terminal.
	 */
	debug: boolean = false
	/**
	 * The address book for all the connected sockets.
	 */
	socketBook: SocketBook = {}
	/**
	 * The auth token that the machine and job agents need to provide to access the service.
	 */
	socketKey: string
	/**
	 * Creates a unique session id for each instance of the broker so we can track different sessions in the log.
	 */
	sessionUuid: string = uuidv4()
	/**
	 * The express server for log access
	 */
	app: Express = express()
	/**
	 * The http server
	 */
	httpServer: HttpServer = createServer(this.app)
	/**
	 * The socket server for brokering the connections between machines and jobs.
	 */
	io: SocketServer = new SocketServer(this.httpServer, {
		path: "/socket/",
		maxHttpBufferSize: 1e8, // 100MB
	})

	/**
	 * Constructs an instance of the broker.
	 * @param config The parmeters required to configure the broker.
	 */
	constructor(config: BrokerConfig) {
		this.accessLogsKey = config.accessLogsKey
		this.logFolderPath = config.logFolderPath
		this.socketKey = config.socketKey

		if (config.debug) {
			this.debug = config.debug
		}

		this.configureExpress()
		this.configureIo()
	}

	/**
	 * Starts the server.
	 */
	start() {
		this.appendToBrokerLog(`broker-starting`)
		this.httpServer.listen(3000)
	}

	/**
	 * Stops the server
	 */
	stop() {
		this.appendToBrokerLog(`broker-stopping`)
		this.io.close()
		this.httpServer.close()
	}

	/**
	 * Configures the logging functionality of the broker.
	 */
	configureExpress() {
		// check if the files exist
		const logFnames = ["broker.log", "messaging.log", "messaging-no-gcode.log"]
		for (const fname of logFnames) {
			const fullPath = `${this.logFolderPath}/${fname}`
			if (!existsSync(fullPath)) {
				if (!existsSync(this.logFolderPath)) {
					mkdirSync(this.logFolderPath)
				}
				writeFileSync(fullPath, "")
			}
		}

		if (this.accessLogsKey != "") {
			this.app.use("/logs/:fname", (req, res, next) => {
				if (!req.headers["logs_key"]) {
					return res.status(401).send()
				}

				if (Array.isArray(req.headers["logs_key"])) {
					return res.status(401).send()
				}

				if (req.headers["logs_key"] != this.accessLogsKey) {
					return res.status(401).send()
				}

				if (logFnames.includes(req.params.fname)) {
					const path = `${this.logFolderPath}/${req.params.fname}`
					return res.sendFile(path, (err) => {
						if (err) {
							next(err)
						}
					})
				}

				return res.status(404).send()
			})
		}
	}

	/**
	 * Configures socket.io for accepting connections.
	 */
	configureIo() {
		if (this.debug) console.log(`configuring-io`)

		this.io.on("connection", (socket) => {
			this.configureSocket(socket)
		})

		// Auth check
		this.io.use((socket, next) => {
			if (!socket.handshake.auth.token) {
				const err = new Error("No authorisation token provided")
				this.appendToBrokerLog(`no-authorisation-token-provided: ${socket.id}`)
				next(err)
			}

			if (!socket.handshake.headers["agent-type"]) {
				const err = new Error("No agent type provided")
				this.appendToBrokerLog(`no-agent-type-provided: ${socket.id}`)
				next(err)
			}

			const token = socket.handshake.auth.token
			if (token != this.socketKey) {
				const err = new Error("Not authorised")
				this.appendToBrokerLog(`socket-not-authorised: ${socket.id}`)
				next(err)
			}

			// @ts-ignore
			if (
				!["machine", "job"].includes(socket.handshake.headers["agent-type"])
			) {
				const err = new Error("Wrong agent type")
				this.appendToBrokerLog(`wrong-agent-type: ${socket.id}`)
				next(err)
			}

			next()
		})
	}

	/**
	 * Configures an incoming socket to broker connections to other sockets.
	 */
	configureSocket(socket: Socket) {
		if (this.debug) console.log(`new-connection: ${socket.id}`)
		this.appendToBrokerLog(`new-connection: ${socket.id}`)

		// Add socket to the address book
		if (typeof socket.handshake.headers["agent-type"] == "string") {
			this.socketBook[socket.id] = {
				socket: socket,
				type: socket.handshake.headers["agent-type"],
			}
		} else {
			// TODO error
		}

		socket.on("disconnect", () => {
			if (this.debug) console.log(`disconnected: ${socket.id}`)
			this.appendToBrokerLog(`disconnected: ${socket.id}`)

			delete this.socketBook[socket.id]
		})

		// Pass-through communications
		socket.on("p2p", (msg: any) => {
			if (this.debug) console.log(`p2p: ${JSON.stringify(msg)}`)
			this.appendToMessagingLog(msg)

			const errMsg = this.validateMsg(msg)
			if (errMsg) {
				socket.emit("msg-error", errMsg)
				return
			}

			// 2. direct the message
			if (!(msg.toId in this.socketBook)) {
				if (this.debug) console.log(`p2p: no agent with this id`)
				socket.emit("msg-error", "No agent with this id")
				return
			}

			// 3. All good, send the message on.
			this.socketBook[msg.toId].socket.emit("p2p", msg)
		})

		socket.on("all-machines", (msg: any) => {
			if (this.debug) console.log(`all-machines: ${JSON.stringify(msg)}`)
			this.appendToMessagingLog(msg)

			const errMsg = this.validateMsg(msg)
			if (errMsg) {
				socket.emit("msg-error", errMsg)
				return
			}

			for (const [_, value] of Object.entries(this.socketBook)) {
				// make sure it is the right type and not itself.
				if (value.type == "machine" && value.socket.id != socket.id) {
					value.socket.emit("all-machines", msg)
				}
			}
		})

		socket.on("all-jobs", (msg: any) => {
			if (this.debug) console.log(`all-jobs: ${JSON.stringify(msg)}`)
			this.appendToMessagingLog(msg)

			const errMsg = this.validateMsg(msg)
			if (errMsg) {
				socket.emit("msg-error", errMsg)
				return
			}

			for (const [_, value] of Object.entries(this.socketBook)) {
				if (value.type == "job" && value.socket.id != socket.id) {
					value.socket.emit("all-jobs", msg)
				}
			}
		})
	}

	validateMsg(msg: any): string {
		// 1. validate message form
		if (
			msg["fromId"] == undefined ||
			msg["toId"] == undefined ||
			msg["subject"] == undefined ||
			msg["body"] == undefined
		) {
			if (this.debug) console.log(`validateMsg: malformed message`)
			return "Malformed message"
		}
		return ""
	}

	/**
	 * Append to the broker log.
	 * @param msg
	 */
	appendToBrokerLog(msg: string) {
		const path = `${this.logFolderPath}/broker.log`
		const entry: BrokerLogEntry = {
			sessionUuid: this.sessionUuid,
			date: new Date(),
			entry: msg,
		}
		appendFile(path, JSON.stringify(entry) + "\n", (err) => {
			if (err) console.log(err)
		})
	}

	/**
	 * Append to the messaging log both with and without gcode.
	 * @param msg
	 */
	appendToMessagingLog(msg: any) {
		const messagingFilePath = `${this.logFolderPath}/messaging.log`
		let entry: MessagingLogEntry = {
			sessionUuid: this.sessionUuid,
			msg: msg,
			date: new Date(),
		}
		appendFile(messagingFilePath, JSON.stringify(entry) + "\n", (err) => {
			if (err) console.log(err)
		})

		const messagingNoGcodeFilePath = `${this.logFolderPath}/messaging-no-gcode.log`
		if (msg.body && msg.body.gcode) {
			entry.msg.body.gcode = ""
		}
		appendFile(
			messagingNoGcodeFilePath,
			JSON.stringify(entry) + "\n",
			(err) => {
				if (err) console.log(err)
			}
		)
	}
}
