/* eslint-disable no-console */

import fs from "node:fs";

import * as Types from "./types/index.js";

import * as Helpers from "./helpers.js";

/**
 * @experimental
 */
export async function start(
	pool: Types.Pool,
	settings: {
		migrationsTableName: string;
		isNeedCleanupAll?: boolean;
		schema?: string;
		pathToSQL: string;
	},
) {
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
				console.log(`${chunk} done!`);
			}
		}

		{
			const query = `DROP TABLE IF EXISTS ${settings.migrationsTableName} CASCADE`;

			await pool.query(query);
			console.log(`${query} done!`);
		}

		if (settings.isNeedCleanupAll) {
			const query = `DROP SCHEMA ${schema} CASCADE; CREATE SCHEMA ${schema};`;

			await pool.query(query);
			console.log(`${query} done!`);
		}

		console.log("All done!");
	} catch (error) {
		return console.log(error);
	}
}
