import type { Socket } from "socket.io"
import { io } from "../app"
import { appConfig } from "../app"
import { SocketEvents } from "../definitions/enums"
import { appendToMessagingLog } from "../routers/log"
import { validateDirectMsg } from "./validate-msg"

export function directMsg(this: Socket, msg: unknown) {
	if (appConfig.debug) console.log(`${this.id} received direct`)
	if (!validateDirectMsg(msg)) {
		this.emit(SocketEvents.MESSAGE_ERROR, validateDirectMsg.errors)
		return
	}
	if (appConfig.debug) console.log(msg)
	appendToMessagingLog(msg, this)
	io.to(msg.to).emit(SocketEvents.DIRECT, msg)
	return
}
