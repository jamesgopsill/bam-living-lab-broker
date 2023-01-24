import type { Socket } from "socket.io"
import { appConfig } from "../app"
import { SocketEvents } from "../definitions/enums"
import { allJobsMsg } from "./all-jobs-msg"
import { allMachinesMsg } from "./all-machines-msg"
import { directMsg } from "./direct-msg"
import { disconnect } from "./disconnect"

export const connection = (socket: Socket) => {
	if (appConfig.debug) console.log(`new-connection: ${socket.id}`)

	const agentType = socket.handshake.headers["agent-type"]
	if (typeof agentType == "string") {
		socket.join(agentType)
	} else {
		console.log("Should not get here!")
	}

	socket.on(SocketEvents.DISCONNECT, disconnect)
	socket.on(SocketEvents.ALL_JOBS, allJobsMsg)
	socket.on(SocketEvents.ALL_MACHINES, allMachinesMsg)
	socket.on(SocketEvents.DIRECT, directMsg)
}
