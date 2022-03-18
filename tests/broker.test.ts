import { Broker, Message } from "../src"
import { io } from "socket.io-client"

const broker = new Broker({
	logFolderPath: `${__dirname}/logs`,
	accessLogsKey: "log-key",
	socketKey: "socket-key",
	debug: true
})

const wait = (ms: number) => new Promise((r, j) => setTimeout(r, ms))

beforeAll(() => {
	broker.start()
})

test(`Test socket connectionn with correct key and agent type`, async () => {
	const s = io("http://localhost:3000", {
		auth: {
			token: "socket-key",
		},
		extraHeaders: {
			"agent-type": "machine"
		},
		path: "/socket/",
	})
	.on("connect", () => {
		expect(true).toBe(true)
		s.close()
	})
	.on("connect_error", (err) => {
		expect(false).toBe(true)
		s.close()
	})

	await wait(100)
})


test(`Test socket connection with correct key and wrong agent type`, async () => {
	const s = io("http://localhost:3000", {
		auth: {
			token: "socket-key",
		},
		extraHeaders: {
			"agent-type": "random"
		},
		path: "/socket/",
	})
	.on("connect_error", (err) => {
		expect(true).toBe(true)
		s.close()
	})

	await wait(100)
})


test(`Test socket connection with invalid key`, async () => {
	const s = io("http://localhost:3000", {
		auth: {
			token: "wrong-key",
		},
		extraHeaders: {
			"agent-type": "random"
		},
		path: "/socket/",
	})
	.on("connect_error", (err) => {
		expect(true).toBe(true)
		s.close()
	})

	await wait(100)
})

test(`Test malformed message content`, async () => {
	const s = io("http://localhost:3000", {
		auth: {
			token: "socket-key",
		},
		extraHeaders: {
			"agent-type": "machine"
		},
		path: "/socket/",
	})
	.on("connect", async () => {
		s.emit("p2p", {
			test: "malformed message"
		})
	})
	.on("connect_error", (err) => {
		expect(false).toBe(true)
		s.close()
	})
	.on("msg-error", (errMsg: string) => {
		expect(true).toBe(true)
		s.close()
	})

	await wait(200)
})

test(`Test wrong toId`, async () => {
	const s = io("http://localhost:3000", {
		auth: {
			token: "socket-key",
		},
		extraHeaders: {
			"agent-type": "machine"
		},
		path: "/socket/",
	})
	.on("connect", async () => {
		const msg: Message = {
			fromId: s.id,
			toId: "some-random-id",
			subject: "test-message",
			body: {}
		}
		s.emit("p2p", msg)
	})
	.on("connect_error", (err) => {
		expect(false).toBe(true)
		s.close()
	})
	.on("msg-error", (errMsg: string) => {
		console.log(errMsg)
		expect(true).toBe(true)
		s.close()
	})

	await wait(200)
})

test(`Test send to all machines`, async () => {
	const job = io("http://localhost:3000", {
		auth: {
			token: "socket-key",
		},
		extraHeaders: {
			"agent-type": "job"
		},
		path: "/socket/",
	})

	const machine = io("http://localhost:3000", {
		auth: {
			token: "socket-key",
		},
		extraHeaders: {
			"agent-type": "machine"
		},
		path: "/socket/",
	})

	job.on("connect", async () => {
		const msg: Message = {
			fromId: job.id,
			toId: "",
			subject: "test-message-to-all-machines",
			body: {}
		}
		job.emit("all-machines", msg)
	})
	.on("connect_error", (err) => {
		expect(false).toBe(true)
		job.close()
	})
	.on("msg-error", (errMsg: string) => {
		expect(false).toBe(true)
		job.close()
	})

	machine.on("connect", async () => {})
	.on("connect_error", (err) => {
		expect(false).toBe(true)
		machine.close()
	})
	.on("msg-error", (errMsg: string) => {
		expect(false).toBe(true)
		machine.close()
	})
	.on("all-machines", (msg) => {
		console.log(msg)
		expect(true).toBe(true)
		job.close()
		machine.close()
	})

	await wait(200)
})

test(`Test send to all jobs`, async () => {
	const machine = io("http://localhost:3000", {
		auth: {
			token: "socket-key",
		},
		extraHeaders: {
			"agent-type": "machine"
		},
		path: "/socket/",
	})


	const job = io("http://localhost:3000", {
		auth: {
			token: "socket-key",
		},
		extraHeaders: {
			"agent-type": "job"
		},
		path: "/socket/",
	})

	machine.on("connect", async () => {
		const msg: Message = {
			fromId: machine.id,
			toId: "",
			subject: "test-message-to-all-jobs",
			body: {}
		}
		machine.emit("all-jobs", msg)
	})
	.on("connect_error", (err) => {
		expect(false).toBe(true)
		//machine.close()
	})
	.on("msg-error", (errMsg: string) => {
		console.log("machine msg-error:", errMsg)
		// expect(false).toBe(true)
		//machine.close()
	})


	job.on("connect", async () => {})
	.on("connect_error", (err) => {
		expect(false).toBe(true)
		//job.close()
	})
	.on("msg-error", (errMsg: string) => {
		expect(false).toBe(true)
		//job.close()
	})
	.on("all-jobs", (msg) => {
		console.log(msg)
		expect(true).toBe(true)
		job.close()
		machine.close()
	})

	await wait(200)
})


test(`Test send direct message`, async () => {

	const machine = io("http://localhost:3000", {
		auth: {
			token: "socket-key",
		},
		extraHeaders: {
			"agent-type": "machine"
		},
		path: "/socket/",
	})

	const job = io("http://localhost:3000", {
		auth: {
			token: "socket-key",
		},
		extraHeaders: {
			"agent-type": "job"
		},
		path: "/socket/",
	})

	machine.on("connect", async () => {})
	.on("connect_error", (err) => {
		expect(false).toBe(true)
	})
	.on("msg-error", (errMsg: string) => {
		expect(false).toBe(true)
	})
	.on("p2p", (msg) => {
		console.log(msg)
		expect(true).toBe(true)
		job.close()
		machine.close()
	})

	job.on("connect", async () => {
		const msg: Message = {
			fromId: job.id,
			toId: machine.id,
			subject: "test-message-to-a-specific-machine",
			body: {}
		}
		job.emit("p2p", msg)
	})
	.on("connect_error", (err) => {
		expect(false).toBe(true)
	})
	.on("msg-error", (errMsg: string) => {
		console.log("job error:", errMsg)
		expect(false).toBe(true)
	})

	await wait(200)
})


afterAll(() => {
	broker.stop()
})