import { Broker } from "../src"
import fetch from "node-fetch"
import { io, Socket } from "socket.io-client"

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

test(`GET logs without auth receives 401`, async () => {
	const res = await fetch("http://localhost:3000/logs/broker.log")
	expect(res.status).toBe(401)
})

test(`GET logs with wrong auth receives 401`, async () => {
	const res = await fetch("http://localhost:3000/logs/broker.log", {
		headers: {
			"logs_key": "wrong-key"
		}
	})
	expect(res.status).toBe(401)
})

test(`GET logs with auth receives 200`, async () => {
	const res = await fetch("http://localhost:3000/logs/broker.log", {
		headers: {
			"logs_key": "log-key"
		}
	})
	expect(res.status).toBe(200)
})

test(`Test socket connection`, async () => {
	const s = io("http://localhost:3000", {
		auth: {
			token: "socket-key",
		},
		path: "/socket/",
	})

	s.on("connect", () => {
		expect(true).toBe(true)
		s.close()
	})

	s.on("connect_error", (err) => {
		expect(false).toBe(true)
		s.close()
	})

	await wait(100)
})

test(`Test socket connection with invalid key`, async () => {
	const s = io("http://localhost:3000", {
		auth: {
			token: "wrong-key",
		},
		path: "/socket/",
	})

	s.on("connect_error", (err) => {
		expect(true).toBe(true)
		s.close()
	})

	await wait(100)
})


afterAll(() => {
	broker.stop()
})