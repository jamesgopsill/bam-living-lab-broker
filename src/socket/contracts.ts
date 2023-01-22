import { existsSync, readFileSync, writeFile } from "node:fs"
import type { Socket } from "socket.io"
import { appConfig } from "../config"
import { Logs, SocketEvents } from "../descriptors/enums"
import type {
	ContractEntry,
	Contracts,
	PostContractMessage,
} from "../descriptors/interfaces"

let contracts: Contracts = {}
const contractsFile = `${appConfig.staticFilesDir}/${Logs.CONTRACTS}`
if (existsSync(contractsFile)) {
	contracts = JSON.parse(readFileSync(contractsFile, "utf8"))
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
	writeFile(contractsFile, JSON.stringify(contracts), (err) => {
		if (err) console.log(err)
	})
}, 10000)
