import { Socket } from "socket.io"
import { io } from "../app"
import { appConfig } from "../app"
import { AgentTypes, SocketEvents } from "../definitions/enums"
import { appendToMessagingLog } from "../routers/log"
import { validateAllMsg } from "./validate-msg"

export function allMachinesMsg(this: Socket, msg: unknown) {
	if (appConfig) console.log(`${this.id} received direct`)
	if (!validateAllMsg(msg)) {
		this.emit(SocketEvents.MESSAGE_ERROR, validateAllMsg.errors)
		return
	}
	appendToMessagingLog(msg, this)
	io.to(AgentTypes.MACHINE).emit(SocketEvents.ALL_MACHINES, msg)
}
