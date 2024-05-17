import fs from "node:fs";

import * as Types from "./types/index.js";

import * as Helpers from "./helpers.js";
import { Logger, TLogger } from "./logger.js";

/**
 * @experimental
 */
export async function start(
	pool: Types.Pool,
	settings: {
		isNeedCleanupAll?: boolean;
		logger?: TLogger | false;
		migrationsTableName: string;
		schema?: string;
		pathToSQL: string;
	},
) {
	const isLoggerEnabled = !(settings.logger === false);

	const logger = new Logger(
		settings.logger
			? settings.logger
			// eslint-disable-next-line no-console
			: { error: console.error, info: console.log },
		isLoggerEnabled,
	);

	try {
		const schema = settings.schema || "public";

		const sqlFiles = (await Helpers.walk(settings.pathToSQL)).reverse();

		let queryResult = "";

		for (const file of sqlFiles) {
			const sql = fs.readFileSync(file).toString();
			const result = Helpers.search(sql);

			queryResult += result;
		}

		if (queryResult) {
			await pool.query(queryResult);

			const chunks = queryResult.split(";").filter((e) => e);

			for (const chunk of chunks) {
				logger.info(`${chunk} done!`);
			}
		}

		{
			const query = `DROP TABLE IF EXISTS ${settings.migrationsTableName} CASCADE`;

			await pool.query(query);
			logger.info(`${query} done!`);
		}

		if (settings.isNeedCleanupAll) {
			const query = `DROP SCHEMA ${schema} CASCADE; CREATE SCHEMA ${schema};`;

			await pool.query(query);
			logger.info(`${query} done!`);
		}

		logger.info("All done!");
	} catch (error) {
		const message = error instanceof Error ? error.message : "unknown error";

		logger.error(message);

		throw error;
	}
}
