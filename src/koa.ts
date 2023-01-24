import Koa from "koa"
import { router as pingRouter } from "./routers/ping"
import { router as logRouter } from "./routers/log"

export const koa = new Koa()

koa.use(pingRouter.routes())
koa.use(pingRouter.allowedMethods())
koa.use(logRouter.routes())
koa.use(logRouter.allowedMethods())