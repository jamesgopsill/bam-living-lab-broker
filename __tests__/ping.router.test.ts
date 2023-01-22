import supertest, { Response } from "supertest"
import { app } from "../src/app"

let server: any
let request: any

beforeAll(async () => {
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
