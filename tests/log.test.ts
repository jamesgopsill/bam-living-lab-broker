import { Broker, Message } from "../src"
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

afterAll(() => {
	broker.stop()
})