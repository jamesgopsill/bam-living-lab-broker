import { v4 as uuidv4 } from "uuid"
import type { AppOptions } from "./app"
import { createApp } from "./app"

const main = async () => {
	let opts: AppOptions = {
		debug: process.env.BAM_DEBUG === "true",
		ssl: process.env.BAM_SSL === "true",
		sslMode: process.env.BAM_SSL_MODE || "",
		email: process.env.BAM_EMAIL || "",
		logToken: process.env.BAM_LOG_TOKEN || "",
		socketToken: process.env.BAM_SOCKET_TOKEN || "",
		staticFilesDir: process.env.BAM_STATIC_FILES_DIR || "",
		domain: process.env.BAM_DOMAIN || "",
		sessionUuid: uuidv4(),
	}

	const app = await createApp(opts)
	if (opts.ssl) {
		app.listen(3000)
		console.log("Gateway running on https://localhost:3000/")
	} else {
		app.listen(3000)
		console.log("Gateway running on http://localhost:3000/")
	}
}

main()
