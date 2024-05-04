import assert from "node:assert";
import test from "node:test";
import path from "node:path";

import pg from "pg";

import { Up, Down } from "../../lib/index.js";

const creds = {
  database: "postgres",
  host: process.env.POSTGRES_HOST || "localhost",
  password: "admin",
  port: parseInt(process.env.POSTGRES_PORT || "", 10) || 5432,
  user: "postgres",
};

export default async () => {
  return test("01 test", async () => {
    const pool = new pg.Pool(creds)

    await Up.start(pool, {
      migrationsTableName: "migration_control",
      pathToSQL: path.resolve(process.cwd(), "src", "test", "01", "migrations", "sql"),
    })

    const { rows } = await pool.query("SELECT * FROM user_roles")

    assert.equal(rows.length, 2);

    await Down.start(pool, {
      migrationsTableName: "migration_control",
      pathToSQL: path.resolve(process.cwd(), "src", "test", "01", "migrations", "sql"),
    })

    await pool.end()
  });

};
