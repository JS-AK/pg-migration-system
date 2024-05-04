/* eslint-disable no-console */

import path from "node:path";

import pg from "pg";

import { Down, Up } from "../../lib/index.js";

const creds = {
	database: "postgres",
	host: "localhost",
	password: "admin",
	port: 5432,
	user: "postgres",
};

const pool = new pg.Pool(creds);

await Up.start(pool, {
	migrationsTableName: "migration_control",
	pathToSQL: path.resolve(process.cwd(), "src", "test", "01", "migrations", "sql"),
});

const { rows } = await pool.query("SELECT * FROM user_roles");

console.log(rows);

await Down.start(pool, {
	migrationsTableName: "migration_control",
	pathToSQL: path.resolve(process.cwd(), "src", "test", "01", "migrations", "sql"),
});

await pool.end();
