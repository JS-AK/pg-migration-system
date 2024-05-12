/* eslint-disable no-console */

import fs from "node:fs";
import path from "node:path";

const defineType = (query: string): {
	type: |"table" | "sequence" | "procedure" | "index" | "function" | "extension" | "type" | "view" | "unknown";
	result: string;
} => {
	// CREATE FUNCTION
	{
		const check = query.split(" create function ").length > 1
			|| query.split(" create or replace function ").length > 1;

		if (check) {
			const chunks = query.split(/ create.*? function /);
			const result = chunks[1];

			if (result) {
				return { result, type: "function" };
			}
		}
	}

	// CREATE PROCEDURE
	{
		const check = query.split(" create procedure ").length > 1
			|| query.split(" create or replace procedure ").length > 1;

		if (check) {
			const chunks = query.split(/ create.*? procedure /);
			const result = chunks[1];

			if (result) {
				return { result, type: "procedure" };
			}
		}
	}

	// CREATE INDEX
	{
		const check = query.split(" create index ").length > 1
			|| query.split(" create unique index ").length > 1;

		if (check) {
			const chunks = query.split(/ create.*? index /);
			const result = chunks[1];

			if (result) {
				return { result, type: "index" };
			}
		}
	}

	// CREATE EXTENSION
	{
		const check = query.split(" create extension ").length > 1;

		if (check) {
			const chunks = query.split(/ create.*? extension /);
			const result = chunks[1];

			if (result) {
				const chunks = result.split("if not exists ");

				const candidate = chunks[1];

				if (candidate) {
					return { result: (candidate + " ").replace(/  +/g, " "), type: "extension" };
				}

				return { result: (result + " ").replace(/  +/g, " "), type: "extension" };
			}
		}
	}

	// CREATE VIEW
	{
		const check = query.split(" create view ").length > 1;

		if (check) {
			const chunks = query.split(/ create.*? view /);
			const result = chunks[1];

			if (result) {
				return { result, type: "view" };
			}
		}
	}

	// CREATE TABLE
	{
		const check = query.split(" create table ").length > 1;

		if (check) {
			const chunks = query.split(/ create.*? table /);
			const result = chunks[1];

			if (result) {
				return { result, type: "table" };
			}
		}
	}

	// CREATE SEQUENCE
	{
		const check = query.split(" create sequence ").length > 1;

		if (check) {
			const chunks = query.split(/ create.*? sequence /);
			const result = chunks[1];

			if (result) {
				return { result, type: "sequence" };
			}
		}
	}

	// CREATE TYPE
	{
		const check = query.split(" create type ").length > 1;

		if (check) {
			const chunks = query.split(/ create.*? type /);
			const result = chunks[1];

			if (result) {
				return { result, type: "type" };
			}
		}
	}

	// SECOND CHANCE TO DETECTION

	{
		const chunks = query.split(/ create.*? function /);
		const result = chunks[1];

		if (result) {
			return { result, type: "function" };
		}
	}

	{
		const chunks = query.split(/ create.*? procedure /);
		const result = chunks[1];

		if (result) {
			return { result, type: "procedure" };
		}
	}

	{
		const chunks = query.split(/ create.*? extension /);
		const result = chunks[1];

		if (result) {
			const chunks = result.split("if not exists ");

			const candidate = chunks[1];

			if (candidate) {
				return { result: (candidate + " ").replace(/  +/g, " "), type: "extension" };
			}

			return { result: (result + " ").replace(/  +/g, " "), type: "extension" };
		}
	}

	{
		const chunks = query.split(/ create.*? view /);
		const result = chunks[1];

		if (result) {
			return { result, type: "view" };
		}
	}

	{
		const chunks = query.split(/ create.*? table /);
		const result = chunks[1];

		if (result) {
			return { result, type: "table" };
		}
	}

	{
		const chunks = query.split(/ alter table.*? rename to /);
		const result = chunks[1];

		if (result) {
			return { result, type: "table" };
		}
	}

	{
		const chunks = query.split(/ create.*? sequence /);
		const result = chunks[1];

		if (result) {
			return { result, type: "sequence" };
		}
	}

	{
		const chunks = query.split(/ create.*? type /);
		const result = chunks[1];

		if (result) {
			return { result, type: "type" };
		}
	}

	return { result: "", type: "unknown" };
};

export const search = (sql: string): string => {
	const queries = ` ${sql}`
		.toLowerCase()
		.replace(/[^a-z0-9,."()_; ]/g, " ")
		.replace(/  +/g, " ")
		.trimEnd()
		.split(";")
		.filter((e) => e);

	let queryResult = "";

	for (const query of queries) {
		const { result, type } = defineType(query);

		switch (type) {
			case "function": {
				const name = result.split("(")[0]?.trim();

				if (name) {
					queryResult += `DROP FUNCTION IF EXISTS ${name} CASCADE;`;
				}

				break;
			}

			case "extension": {
				const name = result.split(" ")[0]?.trim();

				if (name) {
					queryResult += `DROP EXTENSION IF EXISTS ${name} CASCADE;`;
				}

				break;
			}

			case "procedure": {
				const name = result.split("(")[0]?.trim();

				if (name) {
					queryResult += `DROP PROCEDURE IF EXISTS ${name} CASCADE;`;
				}

				break;
			}

			case "sequence": {
				const name = result.split(" ")[0]?.trim();

				if (name) {
					queryResult += `DROP SEQUENCE IF EXISTS ${name} CASCADE;`;
				}

				break;
			}

			case "table": {
				const name = result.split("(")[0]?.trim();

				if (name) {
					queryResult += `DROP TABLE IF EXISTS ${name} CASCADE;`;
				}

				break;
			}

			case "type": {
				const name = result.split(" ")[0]?.trim();

				if (name) {
					queryResult += `DROP TYPE IF EXISTS ${name} CASCADE;`;
				}

				break;
			}

			case "view": {
				const name = result.split(" ")[0]?.trim();

				if (name) {
					queryResult += `DROP VIEW IF EXISTS ${name} CASCADE;`;
				}

				break;
			}

			case "view": {
				const name = result.split(" ")[0]?.trim();

				if (name) {
					queryResult += `DROP INDEX IF EXISTS ${name} CASCADE;`;
				}

				break;
			}

			default: {
				break;
			}
		}
	}

	return queryResult;
};

export const walk = async (dirPath: string): Promise<string[]> => {
	const entries = await fs
		.promises
		.readdir(dirPath, { withFileTypes: true });

	const results: string[] = [];

	await Promise.all(
		entries.map(async (entry) => {
			const childPath = path.join(dirPath, entry.name);

			if (entry.isDirectory()) {
				const nestedResults = await walk(childPath);

				results.push(...nestedResults);
			} else {
				results.push(childPath);
			}
		}),
	);

	return results;
};
