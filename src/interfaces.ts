import { Socket } from "socket.io"

/**
 * The parameters required to configure the broker.
 */
export interface BrokerConfig {
	accessLogsKey: string
	logFolderPath: string
	socketKey: string
	debug?: boolean
}

/**
 * The address book of all the machine and job agent sockets.
 */
export interface SocketBook {
	[key: string]: Socket
}

/**
 * An entry to the brokder log
 */
export interface BrokerLogEntry {
	sessionUuid: string
	entry: string
	date: Date
}

/**
 * An entry to the messaging log
 */
export interface MessagingLogEntry {
	sessionUuid: string
	msg: Message
	date: Date
}

/**
 * The format of a message coming to the broker.
 */
export interface Message {
	header: {
		fromId: string
		toId: string
		subject: string
	}
	body: any
}
