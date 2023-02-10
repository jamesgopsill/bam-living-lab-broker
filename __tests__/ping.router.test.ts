import supertest, { Response } from "supertest"
import { v4 as uuidv4 } from "uuid"
import type { AppOptions } from "../src/app"
import { createApp } from "../src/app"

let server: any
let request: any

beforeAll(async () => {
	const opts: AppOptions = {
		debug: true,
		staticFilesDir: `${__dirname}/tmp`,
		logToken: "test",
		socketToken: "test",
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
