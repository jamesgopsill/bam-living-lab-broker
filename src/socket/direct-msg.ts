import type { Socket } from "socket.io"
import { appConfig, io } from "../app"
import { SocketEvents } from "../definitions/enums"
import { appendToMessagingLog } from "../routers/log"
import { validateDirectMsg } from "./validate-msg"

export function directMsg(this: Socket, msg: unknown) {
	if (appConfig.debug) console.log(`${this.id} received direct`)
	if (!validateDirectMsg(msg)) {
		this.emit(SocketEvents.MESSAGE_ERROR, validateDirectMsg.errors)
		return
	}
	io.to(msg.to).emit(SocketEvents.DIRECT, msg)
	appendToMessagingLog(msg, this)
	return
}
