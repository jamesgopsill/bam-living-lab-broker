import supertest from "supertest"
import { app } from "../src/app"

let server: any
let request: any

beforeAll(async () => {
	server = app.listen()
	request = supertest(server)
})

test(`GET logs without auth receives 401`, async () => {
	await request.get("/logs/broker.log").expect(401)
})

test(`GET logs with wrong auth receives 401`, async () => {
	await request
		.get("/logs/broker.log")
		.set("authorization", "wrong-key")
		.expect(401)
})

test(`GET logs with auth receives 200`, async () => {
	await request.get("/logs/broker.log").set("authorization", "test").expect(200)
})

afterAll(async () => {
	server.close()
})
