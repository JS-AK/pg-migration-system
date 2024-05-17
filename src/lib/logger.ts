export type TLogger = {
	info: (message: string) => void;
	error: (message: string) => void;
};

export class Logger {
	#isEnabled;
	#logger;

	constructor(logger: TLogger, isEnabled: boolean) {
		this.#isEnabled = isEnabled;
		this.#logger = logger;
	}

	info(message: string): void {
		if (!this.#isEnabled) return;

		this.#logger.info(message);
	}

	error(message: string): void {
		if (!this.#isEnabled) return;

		this.#logger.error(message);
	}
}
