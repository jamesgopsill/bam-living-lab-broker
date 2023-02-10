import type { Middleware } from "@koa/router"
import Router from "@koa/router"

export const router = new Router()

const ping: Middleware = (ctx, _) => {
	ctx.body = {
		error: null,
		data: {
			ping: "pong",
		},
	}
}

router.get("/ping", ping)
