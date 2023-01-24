import { existsSync, readFileSync, writeFile } from "node:fs"
import type { Socket } from "socket.io"
import { appConfig } from "../app"
import { Logs, SocketEvents } from "../definitions/enums"
import type {
	ContractEntry,
	Contracts,
	PostContractMessage,
} from "../definitions/interfaces"

export let contracts: Contracts = {}

export const loadContracts = () => {
	const contractsFile = `${appConfig.staticFilesDir}/${Logs.CONTRACTS}`
	if (existsSync(contractsFile)) {
		contracts = JSON.parse(readFileSync(contractsFile, "utf8"))
	}
}

export function postContract(this: Socket, msg: PostContractMessage) {
	const update: ContractEntry = {
		id: this.id,
		msg: msg.msg,
		date: new Date(),
	}
	if (contracts[msg.contractId]) {
		contracts[msg.contractId].push(update)
	} else {
		contracts[msg.contractId] = [update]
	}
}

export function getContract(this: Socket, id: string) {
	if (contracts[id]) {
		this.emit(SocketEvents.GET_CONTRACT, contracts[id])
	} else {
		this.emit(SocketEvents.MESSAGE_ERROR, "No contract found")
	}
}

/**
 * Saves the contracts json to disk every XX seconds for a back up and logging.
 * Interval cleared on http close.
 */
export const contractSaveInterval = setInterval(() => {
	console.log("Saving Contracts")
	const contractsFile = `${appConfig.staticFilesDir}/${Logs.CONTRACTS}`
	writeFile(
		contractsFile,
		JSON.stringify(contracts),
		{
			encoding: "utf-8",
		},
		(err) => {
			if (err) console.log(err)
		}
	)
}, 10000)
