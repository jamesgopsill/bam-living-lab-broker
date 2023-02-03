export interface AllMessage {
	from: string
	subject: string
	body: {}
	extra: {}
}

export interface DirectMessage extends AllMessage {
	to: string
}

export interface PostContractMessage {
	contractId: string
	msg: string
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

export interface ContractEntry {
	id: string
	msg: string
	date: Date
}
