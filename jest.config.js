module.exports = {
	preset: "ts-jest",
	testEnvironment: "node",
	verbose: false,
	testRegex: "\.test\.ts",
	roots: ["__tests__"],
	extensionsToTreatAsEsm: [".ts"],
	maxWorkers: 1,
	transform: {
		// "^.+\\.[tj]sx?$" to process js/ts with `ts-jest`
		// "^.+\\.m?[tj]sx?$" to process js/ts/mjs/mts with `ts-jest`
		"^.+\\.tsx?$": [
			"ts-jest",
			{
			// ts-jest configuration goes here
			},
		],
	},
}