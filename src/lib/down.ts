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
		pathToSQL: string;
	},
) {
	try {
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
			let queryResult = "";

			const tables = (await pool.query(`
			  SELECT tablename
			  FROM pg_tables
			  WHERE schemaname = 'public'
			`)).rows;

			if (tables.length) {
				for (const table of tables) {
					queryResult += `DROP TABLE IF EXISTS ${table.tablename} CASCADE;`;
				}
			}

			const sequences = (await pool.query(`
			  SELECT sequencename
			  FROM pg_sequences
			  WHERE schemaname = 'public'
			`)).rows;

			if (sequences.length) {
				for (const sequence of sequences) {
					queryResult += `DROP SEQUENCE IF EXISTS ${sequence.sequencename} CASCADE;`;
				}
			}

			const functions = (await pool.query(`
				SELECT routines.routine_name, parameters.data_type, parameters.ordinal_position
				FROM information_schema.routines
				LEFT JOIN information_schema.parameters ON routines.specific_name=parameters.specific_name
				WHERE routines.specific_schema='public'
				ORDER BY routines.routine_name, parameters.ordinal_position;
			`)).rows;

			if (functions.length) {
				for (const fn of functions) {
					queryResult += `DROP FUNCTION IF EXISTS ${fn.routine_name} CASCADE;`;
				}
			}

			if (queryResult) {
				await pool.query(queryResult);

				const chunks = queryResult.split(";").filter((e) => e);

				for (const chunk of chunks) {
					console.log(`${chunk} done!`);
				}
			}
		}

		console.log("All done!");
	} catch (error) {
		return console.log(error);
	}
}
