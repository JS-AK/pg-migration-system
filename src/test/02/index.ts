import path from "node:path";
import test from "node:test";

import pg from "pg";

import { Down, Up } from "../../lib/index.js";

const creds = {
	database: "postgres",
	host: process.env.POSTGRES_HOST || "localhost",
	password: "admin",
	port: parseInt(process.env.POSTGRES_PORT || "", 10) || 5432,
	user: "postgres",
};

export default async () => {
	return test("02 test", async () => {
		const pool = new pg.Pool(creds);

		await Down.start(pool, {
			migrationsTableName: "migration_control",
			pathToSQL: path.resolve(process.cwd(), "src", "test", "02", "migrations", "sql"),
		});

		await Up.start(pool, {
			migrationsTableName: "migration_control",
			pathToSQL: path.resolve(process.cwd(), "src", "test", "02", "migrations", "sql"),
		});

		await Down.start(pool, {
			migrationsTableName: "migration_control",
			pathToSQL: path.resolve(process.cwd(), "src", "test", "02", "migrations", "sql"),
		});

		await pool.end();
	});
};
