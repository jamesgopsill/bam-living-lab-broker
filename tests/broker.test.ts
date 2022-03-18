import { Broker, MessageProtocols, Message } from "../src"
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
	})
	.on("connect_error", (err) => {
		expect(false).toBe(true)
	})

	await wait(100)
	s.close()
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
	})

	await wait(100)
	s.close()
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
	})

	await wait(100)
	s.close()
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
		s.emit(MessageProtocols.DIRECT, {
			test: "malformed message"
		})
	})
	.on("connect_error", (err) => {
		expect(false).toBe(true)
	})
	.on(MessageProtocols.MESSAGE_ERROR, (errMsg: string) => {
		expect(true).toBe(true)
	})

	await wait(200)
	s.close()
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
		s.emit(MessageProtocols.DIRECT, msg)
	})
	.on("connect_error", (err) => {
		expect(false).toBe(true)
	})
	.on(MessageProtocols.MESSAGE_ERROR, (errMsg: string) => {
		expect(true).toBe(true)
	})

	await wait(200)
	s.close()
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
		await wait(100)
		const msg: Message = {
			fromId: job.id,
			toId: "",
			subject: "test-message-to-all-machines",
			body: {}
		}
		job.emit(MessageProtocols.ALL_MACHINES, msg)
	})
	.on("connect_error", (err) => {
		expect(false).toBe(true)
	})
	.on(MessageProtocols.MESSAGE_ERROR, (errMsg: string) => {
		expect(false).toBe(true)
	})

	machine.on("connect", async () => {})
	.on("connect_error", (err) => {
		expect(false).toBe(true)
	})
	.on(MessageProtocols.MESSAGE_ERROR, (errMsg: string) => {
		expect(false).toBe(true)
	})
	.on(MessageProtocols.ALL_MACHINES, (msg: Message) => {
		console.log(msg)
		expect(true).toBe(true)
	})

	await wait(200)
	job.close()
	machine.close()
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
		await wait(100)
		const msg: Message = {
			fromId: machine.id,
			toId: "",
			subject: "test-message-to-all-jobs",
			body: {}
		}
		machine.emit(MessageProtocols.ALL_JOBS, msg)
	})
	.on("connect_error", (err) => {
		expect(false).toBe(true)
		
	})
	.on(MessageProtocols.MESSAGE_ERROR, (errMsg: string) => {
		console.log(MessageProtocols.MESSAGE_ERROR, ":", errMsg)
		expect(false).toBe(true)
	})


	job.on("connect", async () => {})
	.on("connect_error", (err) => {
		expect(false).toBe(true)
	})
	.on(MessageProtocols.MESSAGE_ERROR, (errMsg: string) => {
		expect(false).toBe(true)
	})
	.on(MessageProtocols.ALL_JOBS, (msg) => {
		console.log(msg)
		expect(true).toBe(true)
	})

	await wait(200)
	job.close()
	machine.close()
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
	.on(MessageProtocols.MESSAGE_ERROR, (errMsg: string) => {
		console.log(errMsg)
		expect(false).toBe(true)
	})
	.on(MessageProtocols.DIRECT, (msg) => {
		console.log(msg)
		expect(true).toBe(true)
	})

	job.on("connect", async () => {
		const msg: Message = {
			fromId: job.id,
			toId: machine.id,
			subject: "test-message-to-a-specific-machine",
			body: {}
		}
		job.emit(MessageProtocols.DIRECT, msg)
	})
	.on("connect_error", (err) => {
		expect(false).toBe(true)
	})
	.on(MessageProtocols.MESSAGE_ERROR, (errMsg: string) => {
		console.log("job error:", errMsg)
		expect(false).toBe(true)
	})

	await wait(200)
	job.close()
	machine.close()
})

afterAll(() => {
	broker.stop()
})