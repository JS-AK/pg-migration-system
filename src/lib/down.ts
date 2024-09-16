import fs from "node:fs";

import * as Types from "./types/index.js";

import * as Helpers from "./helpers.js";
import { Logger, TLogger } from "./logger.js";

/**
 * @experimental
 */
export async function start(
	client: Types.Pool | Types.PoolClient | Types.Client,
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

	const migrationsTableName = `"${settings.migrationsTableName}"`;

	try {
		if (settings.isNeedCleanupAll) {
			if (!settings.schema) throw new Error("Database Schema is required");

			const schema = `"${settings.schema}"`;

			const query = `DROP SCHEMA ${schema} CASCADE; CREATE SCHEMA ${schema};`;

			await client.query(query);
			logger.info(`${query} done!`);
		} else {
			const sqlFiles = (await Helpers.walk(settings.pathToSQL)).reverse();

			let queryResult = "";

			for (const file of sqlFiles) {
				const sql = fs.readFileSync(file).toString();
				const result = Helpers.search(sql);

				queryResult += result;
			}

			if (queryResult) {
				await client.query(queryResult);

				const chunks = queryResult.split(";").filter((e) => e);

				for (const chunk of chunks) {
					logger.info(`${chunk} done!`);
				}
			}

			{
				const query = `DROP TABLE IF EXISTS ${migrationsTableName} CASCADE`;

				await client.query(query);
				logger.info(`${query} done!`);
			}
		}

		logger.info("All done!");
	} catch (error) {
		const message = error instanceof Error ? error.message : "unknown error";

		logger.error(message);

		throw error;
	}
}
