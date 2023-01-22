export enum IoServerEvents {
	CONNECTION = "connection",
}

export enum SocketEvents {
	DISCONNECT = "disconnect",
	DIRECT = "direct",
	ALL_MACHINES = "all_machines",
	ALL_JOBS = "all_jobs",
	MESSAGE_ERROR = "message_error",
	CONNECT = "connect",
	CONNECT_ERROR = "connect_error",
	POST_CONTRACT = "post_contract",
	GET_CONTRACT = "get_contract",
}

export enum AgentTypes {
	MACHINE = "machine",
	JOB = "job",
}

export enum Logs {
	BROKER = "broker.log",
	MESSAGING = "messaging.log",
	MESSAGING_NO_GCODE = "messaging_no_gcode.log",
	CONTRACTS = "contracts.json",
}
