import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

import * as Types from "./types/index.js";

import * as Helpers from "./helpers.js";
import { Logger, TLogger } from "./logger.js";

type TFile = { fileName: string; filePath: string; timestamp: number; type: "sql" | "js"; };

/**
 * @experimental
 */
export async function start(
	pool: Types.Pool,
	settings: {
		migrationsTableName: string;
		logger?: TLogger | false;
		pathToSQL?: string;
		pathToJS?: string;
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
		const files: TFile[] = [];
		const jsFiles = settings.pathToJS ? await Helpers.walk(settings.pathToJS) : [];
		const sqlFiles = settings.pathToSQL ? await Helpers.walk(settings.pathToSQL) : [];

		for (const file of sqlFiles) {
			const fileNameBase = path.parse(file).base;

			files.push({
				fileName: fileNameBase,
				filePath: file,
				timestamp: parseInt(fileNameBase.split("_")[0] || ""),
				type: "sql",
			});
		}

		for (const file of jsFiles) {
			const fileNameBase = path.parse(file).base;

			if (fileNameBase.split(".js").length === 1) continue;
			files.push({
				fileName: fileNameBase,
				filePath: file,
				timestamp: parseInt(fileNameBase.split("_")[0] || ""),
				type: "js",
			});
		}

		if (!files.length) throw new Error("pathToJS and pathToSQL is empty");

		const sortedByTimestamp = files.sort((a, b) => {
			if (a.timestamp > b.timestamp) return 1;
			if (a.timestamp < b.timestamp) return -1;

			return 0;
		});

		let error = false;

		const migrations: string[] = [];

		try {
			migrations
				.push(
					...(await pool.query<{ title: string; }>(`SELECT * FROM ${settings.migrationsTableName}`))
						.rows
						.map((e) => e.title),
				);
		} catch (err) {
			error = true;

			await pool.query(`
				CREATE TABLE ${settings.migrationsTableName}(
				  id                              BIGSERIAL PRIMARY KEY,
				  title                           TEXT NOT NULL UNIQUE,
				  created_at                      TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
				  updated_at                      TIMESTAMP WITHOUT TIME ZONE
				)
			`);
		}

		for (const file of sortedByTimestamp) {
			if (file.type === "sql") {
				const { fileName, filePath } = file;

				if (error) {
					const sql = fs.readFileSync(filePath).toString();

					await pool.query(sql);
					await pool.query(`INSERT INTO ${settings.migrationsTableName} (title) VALUES ('${fileName}')`);

					logger.info(`${fileName} done!`);
				} else {
					if (!migrations.includes(fileName)) {
						const sql = fs.readFileSync(filePath).toString();

						await pool.query(sql);
						await pool.query(`INSERT INTO ${settings.migrationsTableName} (title) VALUES ('${fileName}')`);

						logger.info(`${fileName} done!`);
					}
				}
			} else if (file.type === "js") {
				const { fileName, filePath } = file;

				if (!migrations.includes(fileName)) {
					const file = await import(pathToFileURL(filePath).href);
					const { error, message } = await file.up(pool);

					if (!error) {
						await pool.query(`INSERT INTO ${settings.migrationsTableName} (title) VALUES ('${fileName}')`);
						logger.info(`${fileName} done!`);
					} else {
						logger.error(`${fileName} not done!`);
						logger.error(message);

						throw new Error(message);
					}
				}
			}
		}

		logger.info("All done!");
	} catch (error) {
		const message = error instanceof Error ? error.message : "unknown error";

		logger.error(message);

		throw error;
	}
}
