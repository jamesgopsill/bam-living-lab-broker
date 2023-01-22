import { Socket } from "socket.io"
import { io } from "../app"
import { appConfig } from "../config"
import { AgentTypes, SocketEvents } from "../descriptors/enums"
import { appendToMessagingLog } from "../routers/log"
import { validateAllMsg } from "./validate-msg"

export function allJobsMsg(this: Socket, msg: unknown) {
	if (appConfig) console.log(`${this.id} received direct`)
	if (!validateAllMsg(msg)) {
		this.emit(SocketEvents.MESSAGE_ERROR, validateAllMsg.errors)
		return
	}
	appendToMessagingLog(msg, this)
	io.to(AgentTypes.JOB).emit(SocketEvents.ALL_JOBS, msg)
}
