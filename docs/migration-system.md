# PostgreSQL Migration System

## Overview

The migration system manages PostgreSQL database migrations, providing commands for creating empty SQL migration files, running migrations up, and rolling back migrations down.

## Usage Example

To effectively use the migration system, it's recommended to maintain the following file structure:

```
migrations
    └── sql # Directory for SQL migration files
```

### Running Migrations Up

```javascript
import path from "node:path";
import { Up } from "@js-ak/pg-migration-system";
import pg from "pg";

const creds = {
    database: "database",
    host: "localhost",
    password: "password",
    port: 5432,
    user: "user",
};

const pool = new pg.Pool(creds);

await Up.start(pool, {
    migrationsTableName: "migration_control",
    pathToSQL: path.resolve(process.cwd(), "migrations", "sql"),
});

await pool.end();
```

### Running Migrations Down

```javascript
import path from "node:path";
import { Down } from "@js-ak/pg-migration-system";
import pg from "pg";

const creds = {
    database: "database",
    host: "localhost",
    password: "password",
    port: 5432,
    user: "user",
};

const pool = new pg.Pool(creds);

await Down.start(pool, {
    migrationsTableName: "migration_control",
    pathToSQL: path.resolve(process.cwd(), "migrations", "sql"),
});

await pool.end();
```

### Running Create Empty SQL file

```javascript
import path from "node:path";
import { CreateEmptySQL } from "@js-ak/pg-migration-system";

await CreateEmptySQL.create(
    path.resolve(process.cwd(), "migrations", "sql")
);
```
