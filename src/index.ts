import express, { Express } from "express"
import { createServer, Server } from "http"
import { BrokerConfig } from "./interface"


export class Broker {
	accessLogsKey = ""
	logFolderPath = ""
	debug: boolean = false
	app = express()
	httpServer: Server 

	constructor(config: BrokerConfig) {
		this.accessLogsKey = config.accessLogsKey
		this.logFolderPath = config.logFolderPath
		if (config.debug) {
			this.debug = config.debug
		}
	}

	start() {
		// Setting up log file access
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

				const logFnames = ["broker.log", "messaging.log", "messaging-no-gcode.log"]
				if (logFnames.includes(req.params.fname)) {
					return res.sendFile(this.logFolderPath+"/"+req.params.fname, (err) => {
						if (err) next(err)
						else console.log('Sent:', req.params.fname)
					})
				}

				return res.status(404).send()
			})

		}

		this.httpServer = createServer(this.app)
		this.httpServer.listen(3000)
		console.log("Serving app")
	}

	stop() {
		this.httpServer.close()
	}

}