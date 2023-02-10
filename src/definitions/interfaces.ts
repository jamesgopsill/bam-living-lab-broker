export interface AllMessage {
	from: string
	subject: string
	body: {
		[k: string]: any
	}
	extra: {
		[k: string]: any
	}
}

export interface DirectMessage extends AllMessage {
	to: string
}

export interface MessagingLogEntry {
	brokerSession: string
	group: string
	fromAgentType: string
	msg: AllMessage | DirectMessage
	date: Date
}

export interface BrokerLogEntry {
	brokerSession: string
	date: Date
	msg: string
}

export interface Contracts {
	[key: string]: [ContractEntry]
}

export interface PostContractMessage {
	id: string
	msg: string
}

export interface ContractEntry {
	from: string
	msg: string
	date: Date
}
