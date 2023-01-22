import type { Socket } from "socket.io"
import { appConfig } from "../config"

export function disconnect(this: Socket) {
	if (appConfig.debug) console.log(`Disconnected: ${this.id}`)
}
