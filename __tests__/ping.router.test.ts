import supertest, { Response } from "supertest"
import { createApp } from "../src/app"
import type { AppOptions } from "../src/app"
import { v4 as uuidv4 } from "uuid"

let server: any
let request: any

beforeAll(async () => {
	const opts: AppOptions = {
		ssl: false,
		debug: true,
		sslMode: "",
		staticFilesDir: `${__dirname}/tmp`,
		logToken: "test",
		socketToken: "test",
		email: "",
		domain: "",
		sessionUuid: uuidv4(),
	}
	const app = await createApp(opts)
	server = app.listen()
	request = supertest(server)
})

test("GET /ping", async () => {
	await request
		.get("/ping")
		.expect(200)
		.then((res: Response) => {
			console.log(res.text)
		})
})

afterAll(async () => {
	server.close()
})
