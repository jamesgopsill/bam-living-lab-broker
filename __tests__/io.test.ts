import { io } from "socket.io-client"
import { v4 as uuidv4 } from "uuid"
import type { AppOptions } from "../src/app"
import { createApp } from "../src/app"
import { SocketEvents } from "../src/definitions/enums"
import { AllMessage, DirectMessage } from "../src/definitions/interfaces"

let server: any
const url = "http://localhost:3000"
const ioConfig = {
	path: "/socket/",
}
const machineAgentConfig = {
	auth: {
		token: "test",
	},
	extraHeaders: {
		"agent-type": "machine",
		"group-key": "test",
	},
	...ioConfig,
}
const jobAgentConfig = {
	auth: {
		token: "test",
	},
	extraHeaders: {
		"agent-type": "job",
		"group-key": "test",
	},
	...ioConfig,
}

const wait = (ms: number) => new Promise((r, j) => setTimeout(r, ms))

beforeAll(async () => {
	const opts: AppOptions = {
		debug: true,
		staticFilesDir: `${__dirname}/tmp`,
		logToken: "test",
		socketToken: "test",
		sessionUuid: uuidv4(),
	}
	const app = await createApp(opts)
	server = app.listen(3000)
})

test(`Socket connection with correct key and agent type`, async () => {
	const s = io(url, machineAgentConfig)
		.on("connect", () => {
			console.log("Connected")
			expect(true).toBe(true)
		})
		.on("connect_error", (err) => {
			expect(false).toBe(true)
		})

	await wait(100)
	s.close()
	await wait(100)
})

test(`Test socket connectionn with correct key and agent type and no group key`, async () => {
	let config = structuredClone(machineAgentConfig)
	config.extraHeaders["group-key"] = ""
	const s = io(url, config)
		.on(SocketEvents.CONNECT, () => {
			expect(false).toBe(true)
		})
		.on(SocketEvents.CONNECT_ERROR, (err) => {
			expect(true).toBe(true)
		})

	await wait(100)
	s.close()
	await wait(100)
})

test(`Test socket connectionn with correct key and agent type and no group key`, async () => {
	let config = structuredClone(machineAgentConfig)
	config.extraHeaders["agent-type"] = "some-other-agent"
	const s = io(url, config)
		.on(SocketEvents.CONNECT, () => {
			expect(false).toBe(true)
		})
		.on(SocketEvents.CONNECT_ERROR, (err) => {
			expect(true).toBe(true)
		})

	await wait(100)
	s.close()
	await wait(100)
})

test(`Test socket connectionn with correct key and agent type and no group key`, async () => {
	let config = structuredClone(machineAgentConfig)
	config.auth.token = "wrong-token"
	const s = io(url, config)
		.on(SocketEvents.CONNECT, () => {
			expect(false).toBe(true)
		})
		.on(SocketEvents.CONNECT_ERROR, (err) => {
			expect(true).toBe(true)
		})

	await wait(100)
	s.close()
	await wait(100)
})

test(`Test malformed message content`, async () => {
	const s = io(url, machineAgentConfig)
		.on(SocketEvents.CONNECT, async () => {
			s.emit(SocketEvents.DIRECT, {
				test: "malformed message",
			})
		})
		.on(SocketEvents.CONNECT_ERROR, (err) => {
			expect(false).toBe(true)
		})
		.on(SocketEvents.MESSAGE_ERROR, (errMsg: string) => {
			expect(true).toBe(true)
		})

	await wait(200)
	s.close()
	await wait(100)
})

test(`Test wrong toId (broker will not respond)`, async () => {
	const s = io(url, machineAgentConfig)
		.on(SocketEvents.CONNECT, async () => {
			const msg: DirectMessage = {
				from: s.id,
				to: "some-random-id",
				subject: "test-message",
				body: {},
				extra: {},
			}
			s.emit(SocketEvents.DIRECT, msg)
		})
		.on(SocketEvents.CONNECT_ERROR, (err) => {
			expect(false).toBe(true)
		})
		.on(SocketEvents.MESSAGE_ERROR, (errMsg: string) => {
			expect(false).toBe(true)
		})

	await wait(200)
	s.close()
	await wait(100)
})

test(`Test send to all machines`, async () => {
	const job = io(url, jobAgentConfig)
	const machine = io(url, machineAgentConfig)

	job
		.on(SocketEvents.CONNECT, async () => {
			await wait(100)
			const msg: AllMessage = {
				from: job.id,
				subject: "test-message-to-all-machines",
				body: {},
				extra: {},
			}
			job.emit(SocketEvents.ALL_MACHINES, msg)
		})
		.on(SocketEvents.CONNECT_ERROR, (err) => {
			expect(false).toBe(true)
		})
		.on(SocketEvents.MESSAGE_ERROR, (errMsg: string) => {
			expect(false).toBe(true)
		})

	machine
		.on(SocketEvents.CONNECT, async () => {})
		.on("connect_error", (err) => {
			expect(false).toBe(true)
		})
		.on(SocketEvents.MESSAGE_ERROR, (errMsg: string) => {
			expect(false).toBe(true)
		})
		.on(SocketEvents.ALL_MACHINES, (msg: DirectMessage) => {
			console.log(msg)
			expect(true).toBe(true)
		})

	await wait(200)
	job.close()
	machine.close()
	await wait(100)
})

test(`Test send to all jobs`, async () => {
	const job = io(url, jobAgentConfig)
	const machine = io(url, machineAgentConfig)

	machine
		.on(SocketEvents.CONNECT, async () => {
			await wait(100)
			const msg: AllMessage = {
				from: machine.id,
				subject: "test-message-to-all-jobs",
				body: {},
				extra: {},
			}
			machine.emit(SocketEvents.ALL_JOBS, msg)
		})
		.on(SocketEvents.CONNECT_ERROR, (err) => {
			expect(false).toBe(true)
		})
		.on(SocketEvents.MESSAGE_ERROR, (errMsg: string) => {
			console.log(SocketEvents.MESSAGE_ERROR, ":", errMsg)
			expect(false).toBe(true)
		})

	job
		.on(SocketEvents.CONNECT, async () => {})
		.on(SocketEvents.CONNECT_ERROR, (err) => {
			expect(false).toBe(true)
		})
		.on(SocketEvents.MESSAGE_ERROR, (errMsg: string) => {
			expect(false).toBe(true)
		})
		.on(SocketEvents.ALL_JOBS, (msg) => {
			console.log(msg)
			expect(true).toBe(true)
		})

	await wait(200)
	job.close()
	machine.close()
	await wait(100)
})

test(`Test send direct message`, async () => {
	const job = io(url, jobAgentConfig)
	const machine = io(url, machineAgentConfig)

	machine
		.on(SocketEvents.CONNECT, async () => {})
		.on(SocketEvents.CONNECT_ERROR, (err) => {
			expect(false).toBe(true)
		})
		.on(SocketEvents.MESSAGE_ERROR, (errMsg: string) => {
			console.log(errMsg)
			expect(false).toBe(true)
		})
		.on(SocketEvents.DIRECT, (msg) => {
			console.log(msg)
			expect(true).toBe(true)
		})

	job
		.on(SocketEvents.CONNECT, async () => {
			await wait(100) // Give time for all the connections to be made before sending messages.
			const msg: DirectMessage = {
				from: job.id,
				to: machine.id,
				subject: "test-message-to-a-specific-machine",
				body: {},
				extra: {},
			}
			job.emit(SocketEvents.DIRECT, msg)
		})
		.on(SocketEvents.CONNECT_ERROR, (err) => {
			expect(false).toBe(true)
		})
		.on(SocketEvents.MESSAGE_ERROR, (errMsg: string) => {
			console.log("job error:", errMsg)
			expect(false).toBe(true)
		})

	await wait(200)
	job.close()
	machine.close()
	await wait(100)
})

afterAll(async () => {
	server.close()
})
