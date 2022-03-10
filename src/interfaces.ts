import { Socket } from "socket.io"

export interface BrokerConfig {
	accessLogsKey: string
	logFolderPath: string
	socketKey: string
	debug?: boolean
}

export interface SocketBook {
	[key: string]: Socket
}

export interface BrokerLogEntry {
	sessionUuid: string
	entry: string
	date: Date
}

export interface MessagingLogEntry {
	sessionUuid: string
	msg: Message
	date: Date
}

export interface Message {
	header: {
		fromId: string
		toId: string
		subject: string
	}
	body: any
}
