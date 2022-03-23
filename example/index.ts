import { Broker } from "../src"

const broker = new Broker({
	logFolderPath: `${__dirname}/logs`,
	accessLogsKey: "log-key",
	socketKey: "socket-key",
	debug: true
})

broker.start()